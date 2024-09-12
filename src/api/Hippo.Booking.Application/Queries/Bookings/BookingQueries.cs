using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Bookings;

public class BookingQueries(IDataContext dataContext, IDateTimeProvider dateTimeProvider) : IBookingQueries
{
    public Task<BookingResponse?> GetBookingById(int bookingId)
    {
        return dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Include(i => i.BookableObject)
            .ThenInclude(i => i.Area)
            .ThenInclude(i => i.Location)
            .Where(x => x.Id == bookingId)
            .Select(x => new BookingResponse
            {
                Id = x.Id,
                Date = x.Date,
                BookableObject = new IdName<int>(x.BookableObjectId, x.BookableObject.Name),
                Area = new IdName<int>(x.BookableObject.AreaId, x.BookableObject.Area.Name),
                Location = new IdName<int>(x.BookableObject.Area.LocationId, x.BookableObject.Area.Location.Name),
                UserId = x.UserId
            })
            .SingleOrDefaultAsync();
    }

    public Task<List<UserBookingsResponse>> GetUpcomingBookingsForUser(string userId)
    {
        return dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Include(i => i.BookableObject)
            .ThenInclude(i => i.Area)
            .ThenInclude(i => i.Location)
            .Where(x => x.Date >= dateTimeProvider.Today && x.UserId == userId)
            .OrderBy(x => x.Date)
            .ThenBy(x => x.Id)
            .Select(x => new UserBookingsResponse
            {
                Id = x.Id,
                Date = x.Date,
                BookableObject = new IdName<int>(x.BookableObjectId, x.BookableObject.Name),
                Area = new IdName<int>(x.BookableObject.AreaId, x.BookableObject.Area.Name),
                Location = new IdName<int>(x.BookableObject.Area.LocationId, x.BookableObject.Area.Location.Name)
            })
            .ToListAsync();
    }

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
                        ExistingBooking = y.Bookings.Where(z => z.Date == date && z.DeletedAt == null)
                            .Select(z => new BookingDayResponse.BookableObjectResponse.DayBookingResponse
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

    public async Task<BookableObjectBookingStateResponse> GetBookedState(int bookableObjectId)
    {
        var bookingState = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.BookableObject)
            .Where(x => x.BookableObjectId == bookableObjectId && x.Date == dateTimeProvider.Today)
            .Select(x => new BookableObjectBookingStateResponse
            {
                IsBooked = true,
                ObjectName = x.BookableObject.Name,
                BookedBy = x.User.FirstName + " " + x.User.LastName
            })
            .SingleOrDefaultAsync();

        return bookingState ?? new BookableObjectBookingStateResponse { IsBooked = false };
    }
}