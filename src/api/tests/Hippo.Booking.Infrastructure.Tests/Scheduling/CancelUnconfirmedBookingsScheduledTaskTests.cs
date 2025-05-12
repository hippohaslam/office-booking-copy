using FluentAssertions;
using Hangfire;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.Scheduling;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Tests.Scheduling;

public class CancelUnconfirmedBookingsScheduledTaskTests
{
    private CancelUnconfirmedBookingsScheduledTask _sut;
    private ISlackClient _slackClient;
    private ILogger<SlackConfirmationScheduledTask> _logger;
    private IDataContext _dataContext;
    private IBackgroundJobClient _backgroundJobClient;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dateTimeProvider = new SystemDateTimeProvider();

        _dataContext = TestHelpers.GetDbContext(nameof(CancelUnconfirmedBookingsScheduledTask));
        
        _backgroundJobClient = Substitute.For<IBackgroundJobClient>();
        
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
        
        _slackClient = Substitute.For<ISlackClient>();
        _slackClient.GetUserIdByEmail("user1@test.com").Returns("testslack1");
        _slackClient.GetUserIdByEmail("user2@test.com").Returns("testslack2");
        _slackClient.GetUserIdByEmail("user3@test.com").Returns((string?)null);
        
        _logger = Substitute.For<ILogger<SlackConfirmationScheduledTask>>();
        
        _sut = new CancelUnconfirmedBookingsScheduledTask(
            _dataContext, 
            dateTimeProvider,
            _slackClient,
            _backgroundJobClient,
            _logger);
    }

    [Test]
    public async Task UsersWithBookingsOnThatDayAreCancelled()
    {
        _slackClient.ClearReceivedCalls();
        
        _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Should()
            .HaveCount(4, "it starts with 4 bookings");
        
        var scheduleContext = new ScheduleContext("{}");
        
        await _sut.RunTask(scheduleContext);
        
        await _slackClient.Received(1).GetUserIdByEmail("user1@test.com");
        await _slackClient.Received(1).GetUserIdByEmail("user2@test.com");
        
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack1"));
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack2"));
        
        _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Should()
            .HaveCount(2, "it should have cancelled 2 bookings");
        
        _backgroundJobClient.ReceivedWithAnyArgs(2);
    }
}