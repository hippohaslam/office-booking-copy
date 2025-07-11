using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core.Tests.Utility;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class BookingEndpointTests : IntegrationTestBase
{
    [OneTimeSetUp]
    public async Task BookingEndpointTestsSetup()
    {
        GetClient();
        await SetUpUser();
    }

    [Test]
    public async Task CreateNewBookingIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObject = await SetUpBookableObject(area);

        var createBookingRequest = new CreateBookingRequest
        {
            BookableObjectId = bookableObject.Id,
            AreaId = area.Id,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "testuser"
        };

        //Act
        var response = await client.PostAsJsonAsync(
            $"booking",
            createBookingRequest);

        //Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var bookingResponse = responseBody.FromJson<BookingResponse>();
        
        bookingResponse.Should().BeEquivalentTo(new BookingResponse
        {
            Area = new IdName<int>(area.Id, area.Name),
            BookableObject = new IdName<int>(bookableObject.Id, bookableObject.Name),
            Date = DateOnly.FromDateTime(DateTime.Now),
            Location = new BookingLocationResponse
            {
                Id = location.Id,
                Name = location.Name,
                Areas = new List<IdName<int>>
                {
                    new(area.Id, area.Name)
                }
            },
            UserId = "testuser"
        }, options => options.Excluding(x => x.Id),
            "the booking response should be as expected");

        var dbBookings = DbContext.Bookings.Where(x =>
            x.UserId == "testuser"
            && x.Date == DateOnly.FromDateTime(DateTime.Now)
            && x.BookableObjectId == bookableObject.Id);

        dbBookings.Should().HaveCount(1, "only 1 booking should exist that matches those details");
        
        response.Headers.Location.Should().Be($"/booking/{dbBookings.Single().Id}", 
            "the location header should be set to the location endpoint");
    }

    [Test]
    public async Task CreateNewBookingForABookedObjectOnTheSameDateReturns400()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObject = await SetUpBookableObject(area);
        await SetUpBooking(bookableObject, DateOnly.FromDateTime(DateTime.Now));

        var createBookingRequest = new CreateBookingRequest
        {
            BookableObjectId = bookableObject.Id,
            AreaId = area.Id,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "testuser"
        };

        //Act
        var response = await client.PostAsJsonAsync(
            "booking",
            createBookingRequest);

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest,
            "a bookable object cannot be booked more than once on the same date");
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Be("\"Booking already exists\"",
            "a bookable object cannot be booked more than once on the same date");

        var dbBookings = DbContext.Bookings.Where(x =>
            x.UserId == "testuser"
            && x.Date == DateOnly.FromDateTime(DateTime.Now)
            && x.BookableObjectId == bookableObject.Id);
        dbBookings.Should().HaveCount(1, "only 1 booking should exist that matches those details");
    }

    [Test]
    public async Task GetUpcomingBookingsShouldReturnExistingBookingsInOrder()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Test Desk 1"),
            await SetUpBookableObject(area, "Test Desk 2")
        };
        await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now.AddDays(3)));
        await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now));
        await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now.AddDays(1)));

        //Act
        var response = await client.GetAsync("booking/upcoming");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBookings = responseContent.FromJson<List<UserBookingsResponse>>();

        var dbBookings = DbContext.Query<Core.Entities.Booking>()
            .Where(x => x.Date >= DateOnly.FromDateTime(DateTime.Now))
            .OrderBy(x => x.Date)
            .ThenBy(x => x.Id)
            .Include(booking => booking.BookableObject)
            .ThenInclude(bookableObject => bookableObject.Area)
            .ThenInclude(area1 => area1.Location).ToList();

        var expectedBookings = new List<UserBookingsResponse>();
        foreach (var booking in dbBookings)
        {
            expectedBookings.Add(new UserBookingsResponse
            {
                Id = booking.Id,
                Date = booking.Date,
                BookableObject = new IdName<int>(id: booking.BookableObjectId, name: booking.BookableObject.Name),
                Location = new IdName<int>(id: booking.BookableObject.Area.LocationId,
                    name: booking.BookableObject.Area.Location.Name),
                Area = new IdName<int>(id: booking.BookableObject.AreaId, name: booking.BookableObject.Area.Name)
            });
        }

        responseBookings.Should().BeEquivalentTo(expectedBookings, options => options.WithStrictOrdering(),
            "the upcoming bookings should be as expected and in the correct order");
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
            await SetUpBookableObject(area, "Booking Test Desk 1"),
            await SetUpBookableObject(area, "Booking Test Desk 2")
        };
        var bookings = new List<Core.Entities.Booking>
        {
            await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now)),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now)),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now),
                x => x.DeletedAt = DateTime.UtcNow)
        };

        //Act
        var response =
            await client.GetAsync(
                $"/booking/location/{location.Id}/area/{area.Id}/{DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd")}");

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
    public async Task GetBookingShouldReturnBookingSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObject = await SetUpBookableObject(area, "Booking Test Desk 1");
        var booking = await SetUpBooking(bookableObject, DateOnly.FromDateTime(DateTime.Now));

        //Act
        var response =
            await client.GetAsync(
                $"/booking/{booking.Id}");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBooking = responseContent.FromJson<BookingResponse>();

        responseBooking.Should().BeEquivalentTo(new BookingResponse
        {
            Area = new IdName<int>(area.Id, area.Name),
            BookableObject = new IdName<int>(bookableObject.Id, bookableObject.Name),
            Date = DateOnly.FromDateTime(DateTime.Now),
            Id = booking.Id,
            Location = new BookingLocationResponse
            {
                Id = location.Id,
                Name = location.Name,
                Areas = new List<IdName<int>>
                {
                    new(area.Id, area.Name)
                }
            },
            UserId = "testuser"
        });
    }

    [Test]
    public async Task GetBookingsForUserInDateRangeShouldReturnBookingsSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObjects = new List<BookableObject>
        {
            await SetUpBookableObject(area, "Booking Date Range Test Desk 1"),
            await SetUpBookableObject(area, "Booking Date Range Test Desk 2")
        };
        var bookings = new List<Core.Entities.Booking>
        {
            await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(new DateTime(2024, 1, 1))),
            await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(new DateTime(2024, 2, 2))),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(new DateTime(2024, 1, 31))),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(new DateTime(2023, 12, 31))),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(new DateTime(2024, 1, 15)),
                x => x.DeletedAt = DateTime.UtcNow)
        };
        
        //Act
        var response =
            await client.GetAsync(
                $"/booking?from={new DateTime(2024, 1, 1).ToString("yyyy-MM-dd")}&to={new DateTime(2024, 1, 31).ToString("yyyy-MM-dd")}");
        
        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseBookings = responseContent.FromJson<UserBookingsResponse[]>();
        var expectedBookings = new List<Core.Entities.Booking>
        {
            bookings[0],
            bookings[2]
        };

        responseBookings.Should().NotBeNullOrEmpty();
        for (var index = 0; index < responseBookings!.Length; index++)
        {
            var responseBooking = responseBookings[index];
            var expectedBooking = expectedBookings[index];
            
            responseBooking.Should().BeEquivalentTo(new UserBookingsResponse
            {
                Id = expectedBooking.Id,
                Date = expectedBooking.Date,
                BookableObject = new IdName<int>(expectedBooking.BookableObject.Id, expectedBooking.BookableObject.Name),
                Location = new IdName<int>(location.Id, location.Name),
                Area = new IdName<int>(area.Id, area.Name)
            });
        }
    }
    
    [Test]
    public async Task DeleteBookingShouldSoftDeleteBooking()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObject = await SetUpBookableObject(area, "Booking Test Desk 1");
        var booking = await SetUpBooking(bookableObject, DateOnly.FromDateTime(DateTime.Now));

        //Act
        var response =
            await client.DeleteAsync(
                $"/booking/{booking.Id}");

        //Assert
        response.EnsureSuccessStatusCode();

        var dbBookings = DbContext.Bookings.Where(x =>
            x.UserId == "testuser"
            && x.DeletedBy == "testuser"
            && x.Date == DateOnly.FromDateTime(DateTime.Now)
            && x.BookableObjectId == bookableObject.Id);
        dbBookings.Should().HaveCount(1, "only 1 booking should exist that matches those details");
    }

    
}