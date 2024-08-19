namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingDayResponse
{
    public DateOnly Date { get; set; }

    public List<BookableObjectResponse> BookableObjects { get; set; } = new();

    public class BookableObjectResponse
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DayBookingResponse? ExistingBooking { get; set; }

        public class DayBookingResponse
        {
            public int? Id { get; set; }

            public string? Name { get; set; }
        }
    }
}