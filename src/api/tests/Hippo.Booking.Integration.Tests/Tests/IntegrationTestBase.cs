using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.Integration.Tests.Tests;

public class IntegrationTestBase
{
    public HttpClient GetClient() => WebFixture.GetClient();

    public HippoBookingDbContext DbContext => WebFixture.DbContext;

    public async Task AddEntity<T>(T entity) where T : class
    {
        DbContext.AddEntity(entity);
        await DbContext.SaveChangesAsync();
    }

    protected async Task<Location> SetUpLocation(string name = "Booking Test Location")
    {
        var location = new Location
        {
            Name = name,
            Description = "Test Location",
            Address = "Test Address",
            SlackChannel = "Test Slack Channel",
            GuideLink = "Test Guide Link"
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

    protected async Task<Core.Entities.Booking> SetUpBooking(
        BookableObject bookableObject, 
        DateOnly date, 
        Action<Core.Entities.Booking>? configureBooking = null)
    {
        var booking = new Core.Entities.Booking
        {
            UserId = "testuser",
            BookableObjectId = bookableObject.Id,
            Date = date
        };
        
        configureBooking?.Invoke(booking);
        
        await AddEntity(booking);
        return booking;
    }

    protected async Task<User> SetUpUser(
        string id = "testuser", 
        string firstName = "Test", 
        string lastName = "User", 
        string email = "testuser@hippodigital.co.uk")
    {
        var user = new User
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Email = email
        };
        var existingUser = DbContext.Users.Where(u => u.Id == "testuser");
        if (!existingUser.Any())
        {
            await AddEntity(user);
        }
        return user;
    }
}