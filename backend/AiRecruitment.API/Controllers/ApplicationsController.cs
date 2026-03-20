using Microsoft.AspNetCore.Mvc;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace AiRecruitment.API.Controllers;

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
    public async Task<IActionResult> Apply(JobApplication application)
    {
        await _unitOfWork.JobApplications.AddAsync(application);
        await _unitOfWork.CompleteAsync();
        return Ok(application);
    }
}
