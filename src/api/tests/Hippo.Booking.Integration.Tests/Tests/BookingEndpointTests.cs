using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Integration.Tests.Tests;

public class BookingEndpointTests : IntegrationTestBase
{
    [SetUp]
    public async Task BookingEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "testuser",
            FirstName = "Test",
            LastName = "User",
            Email = "testuser@hippodigital.co.uk"
        });
    }
    
    [Test]
    public async Task CreateNewBookingIsSuccessful()
    {
        var client = GetClient();
        //Arrange
        var location = new Location
        {
            Name = "Booking Test Location",
            Description = "Test Location"
        };
        await AddEntity(location);
        
        var area = new Area
        {
            Name = "Test Area",
            Description = "Test area",
            FloorPlanJson = "[]",
            LocationId = location.Id,
            Location = location
        };
        await AddEntity(area);

        var bookableObject = new BookableObject
        {
            Name = "Test Bookable Object",
            Description = "Test Bookable Object",
            AreaId = area.Id,
            Area = area
        };
        await AddEntity(bookableObject);

        var createBookingRequest = new CreateBookingRequest
        {
            BookableObjectId = bookableObject.Id,
            AreaId = area.Id,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "testuser"
        };

        //Act
        var response = await client.PostAsJsonAsync(
            $"booking/location/{location.Id}/area/{area.Id}/{createBookingRequest.Date.ToString("yyyy-MM-dd")}/bookable-object/{bookableObject.Id}",
            createBookingRequest);

        //Assert
        response.EnsureSuccessStatusCode();

        var dbBookings = DbContext.Bookings.Where(x =>
            x.UserId == "testuser" 
            && x.Date == DateOnly.FromDateTime(DateTime.Now) 
            && x.BookableObjectId == bookableObject.Id);

        dbBookings.Should().HaveCount(1, "only 1 booking should exist that matches those details");
    }
}