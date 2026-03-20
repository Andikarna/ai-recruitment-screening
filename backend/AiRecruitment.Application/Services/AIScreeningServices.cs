using AiRecruitment.Application.DTOs;
using AiRecruitment.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AiRecruitment.Application.Services;


public class AIScreeningService : IAIScreeningService
{
    private readonly IUnitOfWork _unitOfWork;

    public AIScreeningService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ScreeningResultDto> ScreenCandidateAsync(Guid candidateId, Guid jobId)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(candidateId);
        var job = await _unitOfWork.JobPostings.GetByIdAsync(jobId);

        if (candidate == null || job == null)
        {
            return new ScreeningResultDto { Summary = "Candidate or Job not found." };
        }

        // Logic refined: extracting skills from comma-separated string
        var candidateSkills = candidate.ParsedSkills.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();
            
        var requiredSkills = job.Requirements.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .ToList();

        var matches = candidateSkills.Select(s => new SkillMatchDto
        {
            SkillName = s,
            IsMatched = requiredSkills.Any(rs => rs.Contains(s, StringComparison.OrdinalIgnoreCase)),
            RelevanceScore = requiredSkills.Any(rs => rs.Contains(s, StringComparison.OrdinalIgnoreCase)) ? 1.0 : 0.4
        }).ToList();

        double score = requiredSkills.Count > 0 
            ? (double)matches.Count(m => m.IsMatched) / requiredSkills.Count * 100 
            : 0;

        return new ScreeningResultDto
        {
            CandidateId = 0, // DTO needs update for Guid or keep 0 for now as it's a mock DTO
            CandidateName = $"{candidate.FirstName} {candidate.LastName}",
            OverallScore = Math.Round(score, 2),
            SkillMatches = matches,
            Summary = $"Analysis for {job.Title}: Candidate has {matches.Count(m => m.IsMatched)} matches out of {requiredSkills.Count} requirements."
        };
    }
}
