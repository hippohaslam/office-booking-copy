using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.BookingWaitingList;

public class BookingWaitListResponse
{
    public required int Id { get; init; }
    public required IdName<int> Area { get; init; }
    public required IdName<int> Location { get; init; }
    public required DateOnly DateToBook { get; init; }
    public required DateTime TimeQueued { get; init; } = DateTime.UtcNow;
}