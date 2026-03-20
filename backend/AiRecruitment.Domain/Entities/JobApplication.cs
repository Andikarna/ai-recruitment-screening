using System;
using AiRecruitment.Domain.Common;

namespace AiRecruitment.Domain.Entities;

public class JobApplication : BaseEntity
{
    public Guid JobPostingId { get; set; }
    public JobPosting JobPosting { get; set; } = null!;
    
    public Guid CandidateId { get; set; }
    public Candidate Candidate { get; set; } = null!;
    
    public double MatchScore { get; set; } = 0.0;
    
    public string Status { get; set; } = "Applied"; // Applied, In Review, Interviewing, Offered, Rejected
    public string AiRecommendation { get; set; } = string.Empty; // e.g., "Highly Recommended"
}
