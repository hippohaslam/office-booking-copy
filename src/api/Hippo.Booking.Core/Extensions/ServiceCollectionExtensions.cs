using Hippo.Booking.Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Core.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddScheduledTask<TScheduledTask>(this IServiceCollection services) where TScheduledTask : class, IScheduledTask
    {
        services.AddKeyedScoped<IScheduledTask, TScheduledTask>(typeof(TScheduledTask).Name);
        return services;
    }
}