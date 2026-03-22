using Microsoft.AspNetCore.Mvc;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace AiRecruitment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public JobsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var jobs = await _unitOfWork.JobPostings.GetAllAsync();
        var applications = await _unitOfWork.JobApplications.GetAllAsync();
        
        var result = jobs.Select(j => new 
        {
            j.Id,
            j.Title,
            j.Description,
            j.Requirements,
            j.Location,
            j.IsActive,
            j.CreatedAt,
            j.UpdatedAt,
            CandidatesCount = applications.Count(a => a.JobPostingId == j.Id && a.Status == "Approved")
        });
        
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await _unitOfWork.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound();
        
        var applications = await _unitOfWork.JobApplications.GetAllAsync();
        var candidatesCount = applications.Count(a => a.JobPostingId == id && a.Status == "Approved");
        
        return Ok(new 
        {
            job.Id,
            job.Title,
            job.Description,
            job.Requirements,
            job.Location,
            job.IsActive,
            job.CreatedAt,
            job.UpdatedAt,
            CandidatesCount = candidatesCount
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(JobPosting job)
    {
        await _unitOfWork.JobPostings.AddAsync(job);
        await _unitOfWork.CompleteAsync();
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }
}
