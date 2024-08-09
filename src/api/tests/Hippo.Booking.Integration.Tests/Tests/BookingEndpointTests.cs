using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class BookingEndpointTests : IntegrationTestBase
{
    [OneTimeSetUp]
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

    [Test]
    public async Task CreateNewBookingForABookedObjectOnTheSameDateReturns400()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookableObject = await SetUpBookableObject(area);
        var booking = await SetUpBooking(bookableObject, DateOnly.FromDateTime(DateTime.Now));

        var createBookingRequest = new CreateBookingRequest
        {
            BookableObjectId = booking.Id,
            AreaId = area.Id,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "testuser"
        };

        //Act
        var response = await client.PostAsJsonAsync(
            $"booking/location/{location.Id}/area/{area.Id}/{createBookingRequest.Date.ToString("yyyy-MM-dd")}/bookable-object/{bookableObject.Id}",
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

        var dbBookings = DbContext.Bookings
            .OrderBy(x => x.Date)
            .Include(booking => booking.BookableObject)
            .ThenInclude(bookableObject => bookableObject.Area)
            .ThenInclude(area1 => area1.Location).ToList();

        var expectedBookings = new List<UserBookingsResponse>();
        foreach (var booking in dbBookings)
        {
            expectedBookings.Add(new UserBookingsResponse
            {
                BookingId = booking.Id,
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
    public async Task GetBookingShouldReturnBookingSuccessfully()
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
        var bookings = new List<Core.Entities.Booking>{
            await SetUpBooking(bookableObjects.First(), DateOnly.FromDateTime(DateTime.Now)),
            await SetUpBooking(bookableObjects.Last(), DateOnly.FromDateTime(DateTime.Now))
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
                    ExistingBooking = new BookingDayResponse.BookableObjectResponse.Booking
                    {
                        Id = bookings.First().Id,
                        Name = "Test User"
                    }
                },
                new()
                {
                    Id = bookableObjects.Last().Id,
                    Name = bookableObjects.Last().Name,
                    Description = bookableObjects.Last().Description,
                    ExistingBooking = new BookingDayResponse.BookableObjectResponse.Booking
                    {
                        Id = bookings.Last().Id,
                        Name = "Test User"
                    }
                }
            ]
        });
    }
}