using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingQueries(IDataContext dataContext) : IBookingQueries
{
    public async Task<BookingDayResponse?> GetAreaAndBookingsForTheDay(int locationId, int areaId, DateOnly date)
    {
        var location = await dataContext.Query<Area>(x => x.WithNoTracking())
            .Include(i => i.BookableObjects)
            .ThenInclude(i => i.Bookings)
            .ThenInclude(i => i.User)
            .Where(x => x.LocationId == locationId && x.Id == areaId)
            .Select(x => new BookingDayResponse
            {
                Date = date,
                BookableObjects = x.BookableObjects
                    .Select(y => new BookingDayResponse.BookableObjectResponse
                {
                    Id = y.Id,
                    Name = y.Name,
                    Description = y.Description,
                    ExistingBooking = y.Bookings.Where(z => z.Date == date)
                        .Select(z => new BookingDayResponse.BookableObjectResponse.Booking
                        {
                            Id = z.Id,
                            Name = z.User.FirstName + " " + z.User.LastName
                        })
                        .SingleOrDefault()
                }).ToList()
            })
            .SingleOrDefaultAsync();

        return location;
    }
}