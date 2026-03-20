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

    public ScreeningController(IAIScreeningService screeningService)
    {
        _screeningService = screeningService;
    }

    [HttpGet("screen/{candidateId}")]
    public async Task<IActionResult> ScreenCandidate(Guid candidateId, [FromQuery] Guid jobId)
    {
        var result = await _screeningService.ScreenCandidateAsync(candidateId, jobId);
        return Ok(result);
    }
}
