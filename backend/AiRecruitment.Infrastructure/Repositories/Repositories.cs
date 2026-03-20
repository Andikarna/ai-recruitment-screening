using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AiRecruitment.Application.Interfaces;
using AiRecruitment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AiRecruitment.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<T?> GetByIdAsync(Guid id) => await _context.Set<T>().FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync() => await _context.Set<T>().ToListAsync();

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate) =>
        await _context.Set<T>().Where(predicate).ToListAsync();

    public async Task AddAsync(T entity) => await _context.Set<T>().AddAsync(entity);

    public void Update(T entity) => _context.Set<T>().Update(entity);

    public void Remove(T entity) => _context.Set<T>().Remove(entity);
}

public class CandidateRepository : Repository<Domain.Entities.Candidate>, ICandidateRepository
{
    public CandidateRepository(ApplicationDbContext context) : base(context) { }
}

public class JobPostingRepository : Repository<Domain.Entities.JobPosting>, IJobPostingRepository
{
    public JobPostingRepository(ApplicationDbContext context) : base(context) { }
}

public class JobApplicationRepository : Repository<Domain.Entities.JobApplication>, IJobApplicationRepository
{
    public JobApplicationRepository(ApplicationDbContext context) : base(context) { }
}
