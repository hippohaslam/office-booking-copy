namespace Hippo.Booking.Application.Commands.BookingWaitList;

public interface IDeleteBookingWaitListCommands
{
    /// <summary>
    /// Removes the entry from the waiting list
    /// </summary>
    /// <param name="userId">SSID of the user</param>
    /// <param name="waitListId">Entity Id</param>
    /// <returns>True if successful, false if the wait list booking is not found</returns>
    Task Handle(string userId, int waitListId);
    /// <summary>
    /// Removes all entries from the waiting list for today
    /// </summary>
    Task Handle();
}