using System;
using System.Threading.Tasks;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Infrastructure.Data;

namespace AiRecruitment.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Candidates = new CandidateRepository(_context);
        JobPostings = new JobPostingRepository(_context);
        JobApplications = new JobApplicationRepository(_context);
    }

    public ICandidateRepository Candidates { get; private set; }
    public IJobPostingRepository JobPostings { get; private set; }
    public IJobApplicationRepository JobApplications { get; private set; }

    public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}
