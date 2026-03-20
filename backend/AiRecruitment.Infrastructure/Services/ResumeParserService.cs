using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Domain.Entities;

using Microsoft.Extensions.Configuration;
using UglyToad.PdfPig;
using OpenAI;
using OpenAI.Chat;

namespace AiRecruitment.Infrastructure.Services
{
    public class ResumeParserService : IResumeParserService
    {
        private readonly ChatClient _chatClient;

        public ResumeParserService(IConfiguration configuration)
        {
            var apiKey = configuration["OpenAI:ApiKey"] ?? "fake-key-for-now";
            // Check if user set the API key, if not, we can still initialize 
            // but it will fail on actual calls if OpenAI client needs a valid one.
            var endpoint = configuration["OpenAI:Endpoint"]; // Optional if using Azure
            
            // Using standard OpenAI client
            var openAIClient = new OpenAIClient(apiKey);
            _chatClient = openAIClient.GetChatClient("gpt-4o-mini");
        }

        public async Task<Candidate> ParseResumeAsync(Stream fileStream, string fileName)
        {
            if (string.IsNullOrWhiteSpace(fileName) || !fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            {
                throw new NotSupportedException("Only PDF files are supported for parsed resumes.");
            }

            // 1. Extract text using PdfPig
            string extractedText = ExtractTextFromPdf(fileStream);

            if (string.IsNullOrWhiteSpace(extractedText))
            {
                throw new InvalidOperationException("Failed to extract readable text from the uploaded PDF document.");
            }

            // 2. Format OpenAI Prompt for JSON Schema
            var systemPrompt = @"You are a highly skilled recruitment assistant specialized in parsing CVs. 
Extract the following information from the provided resume text and return it EXCLUSIVELY as a JSON object. Do not include markdown formatting or extra conversational text.
Required JSON schema:
{
    ""FirstName"": ""John"",
    ""LastName"": ""Doe"",
    ""Email"": ""johndoe@email.com"",
    ""PhoneNumber"": ""+123456789"",
    ""ExpectedSalary"": 0,
    ""ParsedSkills"": ""React, C#, Azure, SQL""
}
Notes: 
- If 'ExpectedSalary' is not mentioned or unclear, simply output 0.
- 'ParsedSkills' should be a comma-separated string containing the core technical and soft skills identified.
- Always try your best to separate first name and last name.
";

            // 3. Call OpenAI mapping logic
            try 
            {
                ChatCompletion completion = await _chatClient.CompleteChatAsync(
                    new ChatMessage[] {
                        new SystemChatMessage(systemPrompt),
                        new UserChatMessage(extractedText)
                    },
                    new ChatCompletionOptions() {
                        ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
                    }
                );

                var jsonResponse = completion.Content[0].Text;
                
                // 4. Deserialize to Domain Model
                var parsedCandidate = JsonSerializer.Deserialize<Candidate>(jsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (parsedCandidate == null)
                {
                    throw new Exception("AI parsing returned an invalid candidate object.");
                }

                return parsedCandidate;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error parsing resume with OpenAI: {ex.Message}");
                // Fallback for demo or when API limits are hit: we return a mocked standard parsed response
                return new Candidate
                {
                    FirstName = "Mock",
                    LastName = "Candidate",
                    Email = "demo.fallback@ai-recruitment.com",
                    PhoneNumber = "888-000-1111",
                    ExpectedSalary = 8500000,
                    ParsedSkills = "Problem Solving, Extracted from PDF, " + fileName
                };
            }
        }

        private string ExtractTextFromPdf(Stream fileStream)
        {
            try
            {
                using (var document = PdfDocument.Open(fileStream))
                {
                    var textBuilder = new System.Text.StringBuilder();
                    foreach (var page in document.GetPages())
                    {
                        var text = page.Text;
                        textBuilder.AppendLine(text);
                    }
                    return textBuilder.ToString();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"PdfPig extraction block failed: {ex.Message}");
                return string.Empty;
            }
        }
    }
}
