using Microsoft.AspNetCore.Http; // Added for IFormFile
using Microsoft.AspNetCore.Mvc;
using AiRecruitment.Application.Interfaces;
using System.Threading.Tasks;
using System;

namespace AiRecruitment.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScreeningController : ControllerBase
{
    private readonly IAIScreeningService _screeningService;
    private readonly IResumeParserService _resumeParser;
    private readonly IUnitOfWork _unitOfWork;

    public ScreeningController(IAIScreeningService screeningService, IResumeParserService resumeParser, IUnitOfWork unitOfWork)
    {
        _screeningService = screeningService;
        _resumeParser = resumeParser;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("screen/{candidateId}")]
    public async Task<IActionResult> ScreenCandidate(Guid candidateId, [FromQuery] Guid jobId)
    {
        var result = await _screeningService.ScreenCandidateAsync(candidateId, jobId);
        return Ok(result);
    }

    [HttpPost("upload-and-screen")]
    public async Task<IActionResult> ScreenUploadedCv(IFormFile file, [FromForm] Guid jobId)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (jobId == Guid.Empty)
            return BadRequest("Job ID is required.");

        try
        {
            using var stream = file.OpenReadStream();
            
            // Format raw PDF to DB Candidate
            var candidate = await _resumeParser.ParseResumeAsync(stream, file.FileName);
            candidate.ResumeUrl = file.FileName;
            
            // Save candidate to properly issue an ID
            await _unitOfWork.Candidates.AddAsync(candidate);
            await _unitOfWork.CompleteAsync();

            // Run normal screening workflow using the guaranteed valid DB candidate
            var result = await _screeningService.ScreenCandidateAsync(candidate.Id, jobId);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
