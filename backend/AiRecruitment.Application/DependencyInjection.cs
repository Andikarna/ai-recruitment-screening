using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using AiRecruitment.Application.Interfaces;

namespace AiRecruitment.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssembly(assembly);
        });

        services.AddValidatorsFromAssembly(assembly);

        // Register AI Services
        // Removed IAIScreeningService as it uses OpenAI and belongs to Infrastructure

        return services;
    }
}
