using System.Collections.Generic;
using AiRecruitment.Domain.Common;

namespace AiRecruitment.Domain.Entities;

public class JobPosting : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
