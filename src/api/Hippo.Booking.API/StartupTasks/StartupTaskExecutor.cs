namespace Hippo.Booking.API.StartupTasks;

public class StartupTaskExecutor : IHostedService
{
    private readonly IServiceProvider _serviceProvider;

    public StartupTaskExecutor(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();

        foreach (var task in scope.ServiceProvider.GetServices<IStartupTask>())
        {
            await task.Execute();
        }
    }

    public async Task StopAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();

        foreach (var task in scope.ServiceProvider.GetServices<IShutdownTask>())
        {
            await task.Execute();
        }
    }
}