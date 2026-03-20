using Microsoft.AspNetCore.Mvc;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Domain.Entities;
using System;
using System.Threading.Tasks;

namespace AiRecruitment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public CandidatesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var candidates = await _unitOfWork.Candidates.GetAllAsync();
        return Ok(candidates);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(id);
        if (candidate == null) return NotFound();
        return Ok(candidate);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Candidate candidate)
    {
        await _unitOfWork.Candidates.AddAsync(candidate);
        await _unitOfWork.CompleteAsync();
        return CreatedAtAction(nameof(GetById), new { id = candidate.Id }, candidate);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Candidate candidate)
    {
        if (id != candidate.Id) return BadRequest();
        _unitOfWork.Candidates.Update(candidate);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var candidate = await _unitOfWork.Candidates.GetByIdAsync(id);
        if (candidate == null) return NotFound();
        _unitOfWork.Candidates.Remove(candidate);
        await _unitOfWork.CompleteAsync();
        return NoContent();
    }
}
