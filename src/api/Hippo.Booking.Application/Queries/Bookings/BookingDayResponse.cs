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

        public BookingResponse? ExistingBooking { get; set; }

        public class BookingResponse
        {
            public int? Id { get; set; }

            public string? Name { get; set; }
        }
    }
}