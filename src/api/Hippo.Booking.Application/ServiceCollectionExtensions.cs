using FluentValidation;
using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Queries.Locations;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Application;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHippoBookingApplication(this IServiceCollection services)
    {
        services.AddScoped<ICreateLocationCommmand, LocationCommands>();
        services.AddScoped<IUpdateLocationCommand, LocationCommands>();

        services.AddScoped<ICreateBookableObject, BookableObjectCommands>();
        services.AddScoped<IUpdateBookableObject, BookableObjectCommands>();
        
        services.AddScoped<IValidator<CreateLocationRequest>, CreateLocationRequestValidator>();
        services.AddScoped<IValidator<UpdateLocationRequest>, UpdateLocationRequestValidator>();

        services.AddScoped<ILocationQueries, LocationQueries>();
        
        return services;
    }
}