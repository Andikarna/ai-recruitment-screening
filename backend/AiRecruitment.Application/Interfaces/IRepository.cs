using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace AiRecruitment.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
}

public interface ICandidateRepository : IRepository<Domain.Entities.Candidate> { }
public interface IJobPostingRepository : IRepository<Domain.Entities.JobPosting> { }
public interface IJobApplicationRepository : IRepository<Domain.Entities.JobApplication> { }

public interface IUnitOfWork : IDisposable
{
    ICandidateRepository Candidates { get; }
    IJobPostingRepository JobPostings { get; }
    IJobApplicationRepository JobApplications { get; }
    Task<int> CompleteAsync();
}
