namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingResponse
{
    public int Id { get; set; }

    public int BookableObjectId { get; set; }

    public DateOnly Date { get; set; }

    public int AreaId { get; set; }

    public int LocationId { get; set; }

    public string UserId { get; set; } = string.Empty;
}