using FluentValidation;
using Hippo.Booking.Application.Commands;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Offices;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHippoBookingApplication(this IServiceCollection services)
    {
        services.AddScoped<ICreateOfficeCommmand, OfficeCommands>();
        services.AddScoped<IUpdateOfficeCommand, OfficeCommands>();
        
        services.AddScoped<IValidator<CreateOfficeRequest>, CreateOfficeRequestValidator>();
        services.AddScoped<IValidator<UpdateOfficeRequest>, UpdateOfficeRequestValidator>();

        services.AddScoped<IOfficeQueries, OfficeQueries>();
        
        return services;
    }
}