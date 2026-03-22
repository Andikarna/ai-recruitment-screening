using System;
using System.Collections.Generic;

namespace AiRecruitment.Application.DTOs;

public class ScreeningResultDto
{
    public Guid CandidateId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public double OverallScore { get; set; }
    public List<SkillMatchDto> SkillMatches { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class SkillMatchDto
{
    public string SkillName { get; set; } = string.Empty;
    public bool IsMatched { get; set; }
    public double RelevanceScore { get; set; }
}

public class CandidateDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ParsedSkills { get; set; } = string.Empty;
}
