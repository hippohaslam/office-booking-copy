using FluentAssertions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Application.Tests.Queries;

public class BookingQueriesTests
{
    private BookingQueries _sut;
    private Location _locationData;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        // Arrange
        var dbContext = TestHelpers.GetDbContext(nameof(BookingQueriesTests));
        _locationData = new Location
        {
            Name = "Existing Location",
            Description = "Existing Location Description",
            Areas =
            [
                new Area
                {
                    Name = "Existing Area 1",
                    Description = "Existing Area Description 1",
                    BookableObjects =
                    [
                        new BookableObject
                        {
                            Name = "Existing BookableObject 1",
                            Description = "Existing BookableObject Description 1",
                            Bookings =
                            [
                                new Core.Entities.Booking
                                {
                                    UserId = "1",
                                    Date = DateOnly.FromDateTime(DateTime.Now),
                                    User = new User
                                    {
                                        Id = "1",
                                        FirstName = "Test",
                                        LastName = "User",
                                        Email = "test@test.test"
                                    }
                                }
                            ]
                        }
                    ]
                },
                new Area
                {
                    Name = "Existing Area 2",
                    Description = "Existing Area Description 2",
                    BookableObjects =
                    [
                        new BookableObject
                        {
                            Name = "Existing BookableObject 2",
                            Description = "Existing BookableObject Description 2",
                            Bookings = new List<Core.Entities.Booking>()
                        }
                    ]
                }
            ]
        };
        
        dbContext.AddEntity(_locationData);

        await dbContext.Save();
        
        _sut = new BookingQueries(dbContext, new SystemDateTimeProvider());
    }
    
    [Test]
    public async Task GetBookingByIdDoesNotExistReturnsNull()
    {
        // Act
        var result = await _sut.GetBookingById(999);

        // Assert
        result.Should().BeNull();
    }
    
    [Test]
    public async Task GetBookingByIdReturnsBooking()
    {
        // Act
        var result = await _sut.GetBookingById(1);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(new BookingResponse
        {
            Id = 1,
            Date = DateOnly.FromDateTime(DateTime.Now),
            BookableObject = new IdName<int>(1, "Existing BookableObject 1"),
            Area = new IdName<int>(1, "Existing Area 1"),
            Location = new BookingLocationResponse
            {
                Id = 1,
                Name = "Existing Location",
                Areas = new List<IdName<int>>
                {
                    new(1, "Existing Area 1"),
                    new(2, "Existing Area 2")
                }
            },
            UserId = "1"
        });
    }

    [Test]
    public async Task GetBookingsForAreaAndDateReturnsBookings()
    {
        // Act
        var result = await _sut.GetAreaAndBookingsForTheDay(1, 1, DateOnly.FromDateTime(DateTime.Now));
        
        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(new BookingDayResponse
        {
            Date = DateOnly.FromDateTime(DateTime.Now),
            BookableObjects =
            [
                new()
                {
                    Id = 1,
                    Name = "Existing BookableObject 1",
                    Description = "Existing BookableObject Description 1",
                    ExistingBooking = new BookingDayResponse.BookableObjectResponse.DayBookingResponse
                    {
                        Id = 1,
                        Name = "Test User"
                    }
                }
            ]
        });
    }
    
    [Test]
    public async Task GetAvailabilityForBookableObjectReturnsBookedState()
    {
        // Act
        var result = await _sut.GetBookedState(1);
        
        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(new BookableObjectBookingStateResponse
        {
            IsBooked = true,
            ObjectName = "Existing BookableObject 1",
            BookedBy = "Test User"
        });
    }
    
    [Test]
    public async Task GetAvailabilityForBookableObjectReturnsUnbookedState()
    {
        // Act
        var result = await _sut.GetBookedState(2);
        
        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(new BookableObjectBookingStateResponse
        {
            IsBooked = false,
            ObjectName = "Existing BookableObject 2",
            BookedBy = null
        });
    }
}