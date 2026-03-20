using AiRecruitment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using AiRecruitment.Application.Interfaces;

namespace AiRecruitment.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 35)),
                optionsBuilder => optionsBuilder.EnableRetryOnFailure()));

        // Register Unit of Work
        services.AddScoped<IUnitOfWork, Repositories.UnitOfWork>();

        // Register Resume Parser Service
        services.AddScoped<IResumeParserService, Services.ResumeParserService>();

        return services;
    }
}
