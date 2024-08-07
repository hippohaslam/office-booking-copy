using Hippo.Booking.Core.Models;

namespace Hippo.Booking.Core.Interfaces;

public interface IScheduledTask
{
    Task RunTask(ScheduleContext scheduleContext);
}