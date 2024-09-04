using FluentAssertions;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.Scheduling;
using Microsoft.Extensions.Logging;
using NSubstitute;

namespace Hippo.Booking.Infrastructure.Tests.Scheduling;

public class CancelUnconfirmedBookingsScheduledTaskTests
{
    private CancelUnconfirmedBookingsScheduledTask _sut;
    private IUserNotifier _userNotifier;
    private ILogger<SlackConfirmationScheduledTask> _logger;
    private IDataContext _dataContext;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dateTimeProvider = new SystemDateTimeProvider();

        _dataContext = TestHelpers.GetDbContext(nameof(CancelUnconfirmedBookingsScheduledTask));
        
        _dataContext.AddEntity(new User
        {
            Email = "user1@test.com",
            Id = "1"
        });
        _dataContext.AddEntity(new User
        {
            Email = "user2@test.com",
            Id = "2"
        });
        _dataContext.AddEntity(new User
        {
            Email = "user3@test.com",
            Id = "3"
        });

        _dataContext.AddEntity(new Location
        {
            Name = "Test",
            Areas =
            [
                new Area
                {
                    Name = "Test Area",
                    BookableObjects =
                    [
                        new BookableObject()
                        {
                            Name = "Test Object",
                            Bookings =
                            [
                                new Core.Entities.Booking
                                {
                                    Date = dateTimeProvider.Today,
                                    UserId = "1"
                                },
                                new Core.Entities.Booking
                                {
                                    Date = dateTimeProvider.Today,
                                    UserId = "2"
                                },
                                new Core.Entities.Booking
                                {
                                    Date = dateTimeProvider.Today.AddDays(1),
                                    UserId = "2"
                                },
                                new Core.Entities.Booking
                                {
                                    Date = dateTimeProvider.Today.AddDays(1),
                                    UserId = "3"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        await _dataContext.Save();
        
        _userNotifier = Substitute.For<IUserNotifier>();
        
        _logger = Substitute.For<ILogger<SlackConfirmationScheduledTask>>();
        
        _sut = new CancelUnconfirmedBookingsScheduledTask(_dataContext, dateTimeProvider, _userNotifier, _logger);
    }

    [Test]
    public async Task UsersWithBookingsOnThatDayAreCancelled()
    {
        _userNotifier.ClearReceivedCalls();
        
        _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Count()
            .Should()
            .Be(4, "it starts with 4 bookings");
        
        var scheduleContext = new ScheduleContext("{}");
        
        await _sut.RunTask(scheduleContext);
        
        await _userNotifier.Received(2).NotifyUser(Arg.Any<string>(), Arg.Any<string>());
        
        _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Count()
            .Should()
            .Be(2, "it should have cancelled 2 bookings");
    }
}