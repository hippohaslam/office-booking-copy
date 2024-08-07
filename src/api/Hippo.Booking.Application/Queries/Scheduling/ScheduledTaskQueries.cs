using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Scheduling;

public class ScheduledTaskQueries(IDataContext dataContext) : IScheduledTaskQueries
{
    public Task<List<ScheduledTaskResponse>> GetScheduledTasks()
    {
        return dataContext.Query<ScheduledTask>(x => x.WithNoTracking())
            .Select(x => new ScheduledTaskResponse
            {
                Task = x.Task,
                CronExpression = x.CronExpression,
                TimeZoneId = x.TimeZoneId,
                PayloadJson = x.PayloadJson
            })
            .ToListAsync();
    }
}