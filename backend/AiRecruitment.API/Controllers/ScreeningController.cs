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

    public ScreeningController(IAIScreeningService screeningService, IResumeParserService resumeParser)
    {
        _screeningService = screeningService;
        _resumeParser = resumeParser;
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
            var extractedText = await _resumeParser.ExtractTextAsync(stream, file.FileName);
            var result = await _screeningService.ScreenCvAsync(extractedText, file.FileName, jobId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
