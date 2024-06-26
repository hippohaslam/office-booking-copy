using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingQueries(IDataContext dataContext) : IBookingQueries
{
    public async Task<BookingDayResponse?> GetLocationAndBookingsForTheDay(int locationId, DateOnly date)
    {
        var location = await dataContext.Query<Location>(x => x.WithNoTracking())
            .Include(i => i.BookableObjects)
            .ThenInclude(i => i.Bookings)
            .ThenInclude(i => i.User)
            .Where(x => x.Id == locationId)
            .Select(x => new BookingDayResponse
            {
                Date = date,
                FloorplanJson = x.FloorPlanJson,
                BookableObjects = x.BookableObjects
                    .Select(y => new BookingDayResponse.BookableObjectResponse
                {
                    Id = y.Id,
                    Description = y.Description,
                    ExistingBooking = y.Bookings.Where(z => z.Date == date)
                        .Select(z => new BookingDayResponse.BookableObjectResponse.Booking
                        {
                            Id = z.Id,
                            Name = z.User.Name
                        })
                        .SingleOrDefault()
                }).ToList()
            })
            .SingleOrDefaultAsync();

        return location;
    }
}