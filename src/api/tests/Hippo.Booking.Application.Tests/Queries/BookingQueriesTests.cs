using FluentAssertions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Application.Tests.Queries;

public class BookingQueriesTests
{
    private BookingQueries _sut;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dbContext = TestHelpers.GetDbContext(nameof(BookingQueriesTests));

        dbContext.AddEntity(new Location()
        {
            Name = "Existing Location",
            Description = "Existing Location Description",
            Areas =
            [
                new Area
                {
                    Name = "Existing Area",
                    Description = "Existing Area Description",
                    BookableObjects =
                    [
                        new BookableObject
                        {
                            Name = "Existing BookableObject",
                            Description = "Existing BookableObject Description",
                            Bookings =
                            [
                                new Core.Entities.Booking
                                {
                                    UserId = "1",
                                    Date = DateOnly.FromDateTime(DateTime.Now)
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        await dbContext.Save();
        
        _sut = new BookingQueries(dbContext, new SystemDateTimeProvider());
    }
    
    [Test]
    public async Task GetBookingByIdDoesNotExistReturnsNull()
    {
        var result = await _sut.GetBookingById(999);

        result.Should().BeNull();
    }
    
    [Test]
    public async Task GetBookingByIdReturnsBooking()
    {
        var result = await _sut.GetBookingById(1);

        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(new BookingResponse
        {
            Id = 1,
            Date = DateOnly.FromDateTime(DateTime.Now),
            BookableObject = new IdName<int>(1, "Existing BookableObject"),
            Area = new IdName<int>(1, "Existing Area"),
            Location = new IdName<int>(1, "Existing Location"),
            UserId = "1"
        });
    }
}