using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using AiRecruitment.Application.DTOs;
using AiRecruitment.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace AiRecruitment.Infrastructure.Services
{
    public class AIScreeningService : IAIScreeningService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly string _apiKey;
        private readonly HttpClient _httpClient;

        public AIScreeningService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _apiKey = configuration["Gemini:ApiKey"] ?? configuration["OpenAI:ApiKey"] ?? string.Empty;
            _httpClient = new HttpClient();
        }

        public async Task<ScreeningResultDto> ScreenCandidateAsync(Guid candidateId, Guid jobId)
        {
            var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId);
            var job = await _unitOfWork.JobPostings.GetByIdAsync(jobId);

            if (candidate == null || job == null)
            {
                return new ScreeningResultDto { Summary = "Candidate or Job not found." };
            }

            var systemPrompt = @"You are an expert technical AI recruiter evaluating a candidate for a job position. 
Analyze the candidate's skills and profile against the job requirements.
IMPORTANT: You MUST evaluate 'related' or 'transferable' skills and experiences favorably! 
Do not just look for exact string matches. If a candidate has a highly related skill that serves the same purpose or shows capability, consider it a match (relevance score close to 1.0). 
If they have related roles/positions, grant them higher overall scores and acknowledge their transferable capabilities as 'opportunities'.

Respond EXCLUSIVELY in the following JSON format without any markdown formatting wrappers:
{
  ""OverallScore"": 85.5,
  ""SkillMatches"": [
    {
      ""SkillName"": ""React"",
      ""IsMatched"": true,
      ""RelevanceScore"": 1.0
    }
  ],
  ""Summary"": ""A concise explanation of why this candidate is a good/bad match, highlighting transferable skills.""
}";

            var userPrompt = $@"
Job Title: {job.Title}
Job Description: {job.Description}
Job Requirements: {job.Requirements}

Candidate Name: {candidate.FirstName} {candidate.LastName}
Candidate Skills: {candidate.ParsedSkills}
Expected Salary: {candidate.ExpectedSalary}
";

            if (!string.IsNullOrEmpty(_apiKey))
            {
                try
                {
                    var requestBody = new
                    {
                        system_instruction = new { parts = new { text = systemPrompt } },
                        contents = new[]
                        {
                            new {
                                role = "user",
                                parts = new[] { new { text = userPrompt } }
                            }
                        },
                        generationConfig = new
                        {
                            response_mime_type = "application/json"
                        }
                    };

                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                    var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                    
                    var response = await _httpClient.PostAsync(url, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseJson = await response.Content.ReadAsStringAsync();
                        using var document = JsonDocument.Parse(responseJson);
                        var candidatesArray = document.RootElement.GetProperty("candidates");
                        
                        if (candidatesArray.GetArrayLength() > 0)
                        {
                            var textResponse = candidatesArray[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text").GetString() ?? "";

                            var parsedResult = JsonSerializer.Deserialize<ScreeningResultDto>(textResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                            if (parsedResult != null)
                            {
                                parsedResult.CandidateId = candidate.Id;
                                parsedResult.CandidateName = $"{candidate.FirstName} {candidate.LastName}";
                                return parsedResult;
                            }
                        }
                    }
                    else 
                    {
                        var err = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Gemini API Error: {response.StatusCode} - {err}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error during AI screening with Gemini: {ex.Message}");
                }
            }

            // Fallback naive logic
            var candidateSkills = candidate.ParsedSkills?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList() ?? new List<string>();
            var requiredSkills = job.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList() ?? new List<string>();

            var matches = candidateSkills.Select(s => new SkillMatchDto
            {
                SkillName = s,
                IsMatched = requiredSkills.Any(rs => rs.Contains(s, StringComparison.OrdinalIgnoreCase)),
                RelevanceScore = requiredSkills.Any(rs => rs.Contains(s, StringComparison.OrdinalIgnoreCase)) ? 1.0 : 0.4
            }).ToList();

            double score = requiredSkills.Count > 0 ? (double)matches.Count(m => m.IsMatched) / requiredSkills.Count * 100 : 0;

            return new ScreeningResultDto
            {
                CandidateId = candidate.Id,
                CandidateName = $"{candidate.FirstName} {candidate.LastName}",
                OverallScore = Math.Round(score, 2),
                SkillMatches = matches,
                Summary = $"FALLBACK: Analysis for {job.Title}. Naive matcher found {matches.Count(m => m.IsMatched)} matches."
            };
        }

        public async Task<ScreeningResultDto> ScreenCvAsync(string cvText, string fileName, Guid jobId)
        {
            var job = await _unitOfWork.JobPostings.GetByIdAsync(jobId);

            if (job == null)
            {
                return new ScreeningResultDto { Summary = "Job not found." };
            }

            var systemPrompt = @"You are an expert technical AI recruiter evaluating a candidate for a job position. 
Analyze the candidate's skills and profile against the job requirements based on the provided CV text.
IMPORTANT: You MUST evaluate 'related' or 'transferable' skills and experiences favorably! 
Do not just look for exact string matches. If a candidate has a highly related skill that serves the same purpose or shows capability, consider it a match (relevance score close to 1.0). 
If they have related roles/positions, grant them higher overall scores and acknowledge their transferable capabilities as 'opportunities'.

Respond EXCLUSIVELY in the following JSON format without any markdown formatting wrappers:
{
  ""OverallScore"": 85.5,
  ""SkillMatches"": [
    {
      ""SkillName"": ""React"",
      ""IsMatched"": true,
      ""RelevanceScore"": 1.0
    }
  ],
  ""Summary"": ""A concise explanation of why this candidate is a good/bad match, highlighting transferable skills.""
}";

            var userPrompt = $@"
Job Title: {job.Title}
Job Description: {job.Description}
Job Requirements: {job.Requirements}

Candidate CV Text:
{cvText}
";

            if (!string.IsNullOrEmpty(_apiKey))
            {
                try
                {
                    var requestBody = new
                    {
                        system_instruction = new { parts = new { text = systemPrompt } },
                        contents = new[]
                        {
                            new {
                                role = "user",
                                parts = new[] { new { text = userPrompt } }
                            }
                        },
                        generationConfig = new
                        {
                            response_mime_type = "application/json"
                        }
                    };

                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={_apiKey}";
                    var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                    
                    var response = await _httpClient.PostAsync(url, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseJson = await response.Content.ReadAsStringAsync();
                        using var document = JsonDocument.Parse(responseJson);
                        var candidatesArray = document.RootElement.GetProperty("candidates");
                        
                        if (candidatesArray.GetArrayLength() > 0)
                        {
                            var textResponse = candidatesArray[0]
                                .GetProperty("content")
                                .GetProperty("parts")[0]
                                .GetProperty("text").GetString() ?? "";

                            var parsedResult = JsonSerializer.Deserialize<ScreeningResultDto>(textResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                            if (parsedResult != null)
                            {
                                parsedResult.CandidateId = Guid.Empty;
                                parsedResult.CandidateName = $"Uploaded CV: {fileName}";
                                return parsedResult;
                            }
                        }
                    }
                    else 
                    {
                        var err = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Gemini API Error: {response.StatusCode} - {err}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error during AI CV screening with Gemini: {ex.Message}");
                }
            }

            // Fallback naive logic
            var requiredSkills = job.Requirements?.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToList() ?? new List<string>();

            var matches = requiredSkills.Select(s => new SkillMatchDto
            {
                SkillName = s,
                IsMatched = cvText.Contains(s, StringComparison.OrdinalIgnoreCase),
                RelevanceScore = cvText.Contains(s, StringComparison.OrdinalIgnoreCase) ? 1.0 : 0.4
            }).ToList();

            double score = requiredSkills.Count > 0 ? (double)matches.Count(m => m.IsMatched) / requiredSkills.Count * 100 : 0;

            return new ScreeningResultDto
            {
                CandidateId = Guid.Empty,
                CandidateName = $"Uploaded CV: {fileName}",
                OverallScore = Math.Round(score, 2),
                SkillMatches = matches,
                Summary = $"FALLBACK: Analysis for {job.Title}. Naive text matcher found {matches.Count(m => m.IsMatched)} required skills mentioned in CV."
            };
        }
    }
}
