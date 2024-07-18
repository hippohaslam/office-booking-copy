namespace Hippo.Booking.Application.Queries.Scheduling;

public interface IScheduledTaskQueries
{
    Task<List<ScheduledTaskResponse>> GetScheduledTasks();
}