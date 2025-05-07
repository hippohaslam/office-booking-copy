using FluentAssertions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Application.Tests.Queries;

public class BookingWaitlistQueriesTests
{
    private BookingWaitingListQueries _sut;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dbContext = TestHelpers.GetDbContext(nameof(BookingWaitingListQueries));
        _sut = new BookingWaitingListQueries(dbContext);

        var location = new Location
        {
            Name = "Test Location",
            Description = "Test Location Description",
            Areas =
            [
                new Area
                {
                    Id = 1,
                    Name = "Test Area",
                    Description = "Test Area Description"
                },
            ]
        };
        
        var secondLocation = new Location
        {
            Name = "Test Location 2",
            Description = "Test Location Description 2",
            Areas =
            [
                new Area
                {
                    Id = 2,
                    Name = "Test Area 2",
                    Description = "Test Area Description 2"
                },
            ]
        };

        dbContext.AddEntity(location);
        dbContext.AddEntity(secondLocation);
        await dbContext.Save();

        var area = location.Areas.First();
        var bookingWaitList1 = new BookingWaitList
        {
            UserId = "test-user-id",
            AreaId = area.Id,
            DateToBook = DateOnly.FromDateTime(DateTime.Now),
            TimeQueued = DateTime.Now
        };

        var area2 = secondLocation.Areas.First();
        var bookingWaitList2 = new BookingWaitList
        {
            UserId = "test-user-id",
            AreaId = area2.Id,
            DateToBook = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            TimeQueued = DateTime.Now
        };

        dbContext.AddEntity(bookingWaitList1);
        dbContext.AddEntity(bookingWaitList2);
        await dbContext.Save();
    }

    [Test]
    public async Task GetUsersBookingWaitList_WillReturnAllBookings()
    {
        // Arrange
        
        // Act
        var result = await _sut.GetBookingWaitListForUserAsync("test-user-id");
        
        // Assert
        result.Should().HaveCount(2);
        
        var bookingWaitList = result.First();
        bookingWaitList.Area.Should().BeEquivalentTo(new IdName<int>(1, "Test Area"));
        bookingWaitList.Location.Should().BeEquivalentTo(new IdName<int>(1, "Test Location"));
        bookingWaitList.DateToBook.Should().Be(DateOnly.FromDateTime(DateTime.Now));
        
        var bookingWaitList2 = result.Last();
        bookingWaitList2.Area.Should().BeEquivalentTo(new IdName<int>(2, "Test Area 2"));
        bookingWaitList2.Location.Should().BeEquivalentTo(new IdName<int>(2, "Test Location 2"));
        bookingWaitList2.DateToBook.Should().Be(DateOnly.FromDateTime(DateTime.Now.AddDays(1)));
    }
    
    [Test]
    public async Task GetUsersBookingWaitList_WillReturnEmptyListIfNoneFound()
    {
        // Arrange
        
        // Act
        var result = await _sut.GetBookingWaitListForUserAsync("test-user-id-2");
        
        // Assert
        result.Should().HaveCount(0);
    }
}