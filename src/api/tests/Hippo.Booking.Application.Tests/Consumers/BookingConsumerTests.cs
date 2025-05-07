using FluentAssertions;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Commands.BookingWaitList;
using Hippo.Booking.Application.Consumers;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Consumers;

public class BookingConsumerTests
{
    private BookingConsumer _bookingConsumer;
    private HippoBookingDbContext _dataContext;
    private IBookingCalendar _bookingCalendar;
    private Core.Entities.Booking _booking;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = (HippoBookingDbContext)TestHelpers.GetDbContext(nameof(BookingConsumerTests));
        
        _booking = new Core.Entities.Booking
        {
            User = new User
            {
                Id = "1",
                Email = "test@user.com"
            },
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(2)),
            BookableObject = new BookableObject
            {
                Name = "Existing BookableObject",
                Description = "Existing BookableObject Description",
                Area = new Area
                {
                    Name = "Existing Area",
                    Description = "Existing Area Description",
                    Location = new Location
                    {
                        Name = "Existing Location",
                        Description = "Existing Location Description"
                    }
                }
            },
            CalendarEventId = "existing"
        };
        
        _dataContext.AddEntity(_booking);

        await _dataContext.Save();

        _bookingCalendar = Substitute.For<IBookingCalendar>();
        _bookingCalendar
            .CreateBookingEvent("test@user.com", Arg.Any<string>(), Arg.Any<DateOnly>())
            .Returns("mocked");

        _bookingConsumer = new BookingConsumer(
            Substitute.For<ICreateBookingCommand>(),
            Substitute.For<IBookingWaitingListQueries>(),
            Substitute.For<IDeleteBookingWaitListCommands>(),
            _bookingCalendar,
            NullLogger<BookingConsumer>.Instance,
            _dataContext
        );
    }

    [Test]
    public async Task WhenBookingCreated_CreateCalendarEvent()
    {
        await _bookingConsumer.HandleAsync(new BookingCreatedRequest
        {
            BookingId = _booking.Id
        });
        
        await _bookingCalendar.Received().CreateBookingEvent("test@user.com",
            Arg.Any<string>(),
            _booking.Date);
        
        var newBooking = await _dataContext.Query<Core.Entities.Booking>()
            .SingleOrDefaultAsync(x => x.Id == _booking.Id);
        
        newBooking!.CalendarEventId.Should().Be("mocked");
    }
    
    [Test]
    public async Task WhenBookingDeleted_DeleteCalendarEvent()
    {
        await _bookingConsumer.HandleAsync(new BookingCancelledRequest
        {
            UserEmail = _booking.User.Email,
            Date = DateOnly.FromDateTime(DateTime.Now),
            AreaId = _booking.BookableObject.AreaId,
            BookableObjectId = _booking.BookableObjectId,
            CalendarEventId = _booking.CalendarEventId
        });
        
        await _bookingCalendar.Received().DeleteBookingEvent("test@user.com", _booking.CalendarEventId!);
    }
}