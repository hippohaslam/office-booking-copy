using System.Text.Json;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.Integration.Tests.Tests;

public class IntegrationTestBase
{
    public HttpClient GetClient() => WebFixture.GetClient();

    public HippoBookingDbContext DbContext => WebFixture.DbContext;

    public async Task AddEntity<T>(T entity) where T : class
    {
        DbContext.Set<T>().Add(entity);
        await DbContext.SaveChangesAsync();
    }

    protected async Task<Location> SetUpLocation(string name = "Booking Test Location")
    {
        var location = new Location
        {
            Name = name,
            Description = "Test Location"
        };
        await AddEntity(location);
        return location;
    }

    protected async Task<Area> SetUpArea(Location location, string name = "Test Area")
    {
        var area = new Area
        {
            Name = name,
            Description = "Test area",
            FloorPlanJson = "[]",
            LocationId = location.Id,
            Location = location,
            AreaTypeId = AreaTypeEnum.Desks
        };
        await AddEntity(area);
        return area;
    }

    protected async Task<BookableObject> SetUpBookableObject(Area area, string name = "Test Bookable Object")
    {
        var bookableObject = new BookableObject
        {
            Name = name,
            Description = "Test Bookable Object",
            AreaId = area.Id,
            Area = area,
            BookableObjectTypeId = BookableObjectTypeEnum.Standard
        };
        await AddEntity(bookableObject);
        return bookableObject;
    }

    protected async Task<Core.Entities.Booking> SetUpBooking(BookableObject bookableObject, DateOnly date)
    {
        var booking = new Core.Entities.Booking
        {
            UserId = "testuser",
            BookableObjectId = bookableObject.Id,
            Date = date
        };
        await AddEntity(booking);
        return booking;
    }
}