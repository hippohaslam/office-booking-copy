using System.Net;
using FluentAssertions;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class ScreenEndpointTests : IntegrationTestBase
{
    [OneTimeSetUp]
    public async Task ScreenEndpointTestsSetup()
    {
        GetClient();
        await SetUpUser();
    }
    
    [Test]
    public async Task GetAvailabilityShouldReturnBookableObjectBookedStateSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 1"),
            await SetUpBookableObject(area, "Screen Test Desk 2")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now));
        await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now));
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now),
                x => x.DeletedAt = DateTime.UtcNow);
        client.DefaultRequestHeaders.Add("Auth-Key", "test");

        //Act
        var response =
            await client.GetAsync(
                $"/screen/availability/{bookableObjects.First().Id}");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBooking = responseContent.FromJson<BookableObjectBookingStateResponse>();
        responseBooking.Should().BeEquivalentTo(new BookableObjectBookingStateResponse
        {
            IsBooked = true,
            ObjectName = "Screen Test Desk 1",
            BookedBy = "Test User"
        });
    }
    
    [Test]
    public async Task GetAvailabilityShouldReturnBookableObjectUnbookedStateSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 3")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now),
            x => x.DeletedAt = DateTime.UtcNow);
        client.DefaultRequestHeaders.Add("Auth-Key", "test");

        //Act
        var response =
            await client.GetAsync(
                $"/screen/availability/{bookableObjects.Single().Id}");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBooking = responseContent.FromJson<BookableObjectBookingStateResponse>();
        responseBooking.Should().BeEquivalentTo(new BookableObjectBookingStateResponse
        {
            IsBooked = false,
            ObjectName = "Screen Test Desk 3",
            BookedBy = null
        });
    }
    
    [Test]
    public async Task GetAvailabilityShouldReturn404IfAuthHeaderIsMissing()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 4")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now),
            x => x.DeletedAt = DateTime.UtcNow);

        //Act
        var response =
            await client.GetAsync(
                $"/screen/availability/{bookableObjects.Single().Id}");

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    
    [Test]
    [TestCase("")]
    [TestCase("incorrect")]
    public async Task GetAvailabilityShouldReturn404IfAuthHeaderIsIncorrect(string authKeyValue)
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 5")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now),
            x => x.DeletedAt = DateTime.UtcNow);
        client.DefaultRequestHeaders.Add("Auth-Key", authKeyValue);

        //Act
        var response =
            await client.GetAsync(
                $"/screen/availability/{bookableObjects.Single().Id}");

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    
    [Test]
    public async Task GetBookingsForDayShouldReturnBookingsSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 6"),
            await SetUpBookableObject(area, "Screen Test Desk 7")
        };
        var bookings = new List<Core.Entities.Booking>
        {
            await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now)),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now)),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now),
                x => x.DeletedAt = DateTime.UtcNow)
        };
        client.DefaultRequestHeaders.Add("Auth-Key", "test");

        //Act
        var response =
            await client.GetAsync(
                $"/screen/location/{location.Id}/area/{area.Id}/{DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd")}");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBooking = responseContent.FromJson<BookingDayResponse>();

        responseBooking.Should().BeEquivalentTo(new BookingDayResponse
        {
            Date = DateOnly.FromDateTime(DateTime.Now),
            BookableObjects =
            [
                new()
                {
                    Id = bookableObjects.First().Id,
                    Name = bookableObjects.First().Name,
                    Description = bookableObjects.First().Description,
                    ExistingBooking = new BookingDayResponse.BookableObjectResponse.DayBookingResponse
                    {
                        Id = bookings[0].Id,
                        Name = "Test User"
                    }
                },
                new()
                {
                    Id = bookableObjects.Last().Id,
                    Name = bookableObjects.Last().Name,
                    Description = bookableObjects.Last().Description,
                    ExistingBooking = new BookingDayResponse.BookableObjectResponse.DayBookingResponse
                    {
                        Id = bookings[1].Id,
                        Name = "Test User"
                    }
                }
            ]
        });
    }
    
    [Test]
    public async Task GetBookingsForDayShouldReturn404IfAuthHeaderIsMissing()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 8")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now));
        
        //Act
        var response =
            await client.GetAsync(
                $"/screen/location/{location.Id}/area/{area.Id}/{DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd")}");

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    
    [Test]
    [TestCase("")]
    [TestCase("incorrect")]
    public async Task GetBookingsForDayShouldReturn404IfAuthHeaderIsIncorrect(string authKeyValue)
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Screen Test Desk 9")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now));
        client.DefaultRequestHeaders.Add("Auth-Key", authKeyValue);

        //Act
        var response =
            await client.GetAsync(
                $"/screen/location/{location.Id}/area/{area.Id}/{DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd")}");

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}