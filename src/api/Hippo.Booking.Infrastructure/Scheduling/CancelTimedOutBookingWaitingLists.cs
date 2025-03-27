using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Commands.BookingWaitList;
using Hippo.Booking.Core.Interfaces;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Infrastructure.Scheduling;

public interface ICancelTimedOutBookingWaitingLists
{
    Task RunTask();
}

public class CancelTimedOutBookingWaitingLists(
    ILogger<CancelTimedOutBookingWaitingLists> logger,
    IDeleteBookingWaitListCommands deleteBookingWaitListCommands,
    IDateTimeProvider dateTimeProvider) : ICancelTimedOutBookingWaitingLists
{
    public async Task RunTask()
    {
        logger.LogInformation("Cancel waiting list bookings for {Today}", dateTimeProvider.Today);
        await deleteBookingWaitListCommands.Handle();
    }
}