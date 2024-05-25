namespace Hippo.Booking.API.StartupTasks;

public static class StartupTaskExtensions
{
    public static IServiceCollection AddStartupTask<TStartupTask>(this IServiceCollection services)
        where TStartupTask : class, IStartupTask
    {
        return services.AddScoped<IStartupTask, TStartupTask>();
    }
}