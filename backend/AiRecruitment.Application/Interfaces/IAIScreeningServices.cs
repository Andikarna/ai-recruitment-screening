using AiRecruitment.Application.DTOs;
using System;
using System.Threading.Tasks;

namespace AiRecruitment.Application.Interfaces;



public interface IAIScreeningService
{
    Task<ScreeningResultDto> ScreenCandidateAsync(Guid candidateId, Guid jobId);
}
