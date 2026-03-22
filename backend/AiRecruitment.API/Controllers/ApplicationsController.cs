using Microsoft.AspNetCore.Mvc;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace AiRecruitment.API.Controllers;

public class CreateApplicationDto
{
    public Guid JobPostingId { get; set; }
    public Guid CandidateId { get; set; }
    public double MatchScore { get; set; }
    public string Status { get; set; } = string.Empty;
    public string AiRecommendation { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public ApplicationsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications = await _unitOfWork.JobApplications.GetAllAsync();
        return Ok(applications);
    }

    [HttpPost]
    public async Task<IActionResult> Apply(CreateApplicationDto dto)
    {
        // Skip DB Foreign Key constraint errors for arbitrary CVs by logging or catching?
        // Actually, we'll try to save. If CandidateId is fake, it might throw DbUpdateException.
        try 
        {
            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                JobPostingId = dto.JobPostingId,
                CandidateId = dto.CandidateId,
                MatchScore = dto.MatchScore,
                Status = dto.Status,
                AiRecommendation = dto.AiRecommendation,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.JobApplications.AddAsync(application);
            await _unitOfWork.CompleteAsync();
            
            return Ok(application);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Failed to save application. Ensure the Candidate and Job exist.", error = ex.Message });
        }
    }
}
