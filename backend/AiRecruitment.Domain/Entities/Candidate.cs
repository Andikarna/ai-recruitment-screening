using System.Collections.Generic;
using AiRecruitment.Domain.Common;

namespace AiRecruitment.Domain.Entities;

public class Candidate : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public decimal ExpectedSalary { get; set; }
    public string ResumeUrl { get; set; } = string.Empty;
    public string ParsedSkills { get; set; } = string.Empty; // Storing as JSON
    public string ParsedExperience { get; set; } = string.Empty; // Storing as JSON
    public string ParsedEducation { get; set; } = string.Empty; // Storing as JSON
    
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
