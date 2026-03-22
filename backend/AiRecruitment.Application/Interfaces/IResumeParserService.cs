using System.IO;
using System.Threading.Tasks;
using AiRecruitment.Domain.Entities;

namespace AiRecruitment.Application.Interfaces
{
    public interface IResumeParserService
    {
        Task<Candidate> ParseResumeAsync(Stream fileStream, string fileName);
        Task<string> ExtractTextAsync(Stream fileStream, string fileName);
    }
}
