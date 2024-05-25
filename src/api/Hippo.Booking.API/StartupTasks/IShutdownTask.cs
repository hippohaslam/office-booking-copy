namespace Hippo.Booking.API.StartupTasks;

public interface IShutdownTask
{
    Task Execute();
}