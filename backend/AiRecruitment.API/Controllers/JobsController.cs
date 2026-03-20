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
        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await _unitOfWork.JobPostings.GetByIdAsync(id);
        if (job == null) return NotFound();
        return Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> Create(JobPosting job)
    {
        await _unitOfWork.JobPostings.AddAsync(job);
        await _unitOfWork.CompleteAsync();
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }
}
