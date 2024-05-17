using FluentValidation;
using Hippo.Booking.Application.Commands;
using Hippo.Booking.Application.Models;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHippoBookingApplication(this IServiceCollection services)
    {
        services.AddTransient<IMediator, Mediator>();
        
        services.AddTransient<IHandler<CreateSiteRequest>, SiteCommands>();
        services.AddTransient<IValidator<CreateSiteRequest>, CreateSiteRequestValidator>();
        
        return services;
    }
}