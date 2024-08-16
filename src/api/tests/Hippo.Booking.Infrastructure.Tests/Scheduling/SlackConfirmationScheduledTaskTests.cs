using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.EF;
using Hippo.Booking.Infrastructure.Scheduling;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Tests.Scheduling;

public class SlackConfirmationScheduledTaskTests
{
    private SlackConfirmationScheduledTask _sut;
    private ISlackClient _slackClient;
    private ILogger<SlackConfirmationScheduledTask> _logger;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dateTimeProvider = new SystemDateTimeProvider();
        
        var dbOptions =  new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseInMemoryDatabase(nameof(SlackConfirmationScheduledTaskTests))
            .Options;

        var dataContext = new HippoBookingDbContext(dbOptions);
        
        dataContext.AddEntity(new User
        {
            Email = "user1@test.com",
            Id = "1"
        });
        dataContext.AddEntity(new User
        {
            Email = "user2@test.com",
            Id = "2"
        });
        dataContext.AddEntity(new User
        {
            Email = "user3@test.com",
            Id = "3"
        });

        dataContext.AddEntity(new Location
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

        await dataContext.Save();
        
        _slackClient = Substitute.For<ISlackClient>();
        _slackClient.GetUserIdByEmail("user1@test.com").Returns("testslack1");
        _slackClient.GetUserIdByEmail("user2@test.com").Returns("testslack2");
        _slackClient.GetUserIdByEmail("user3@test.com").Returns((string?)null);
        
        _logger = Substitute.For<ILogger<SlackConfirmationScheduledTask>>();
        
        _sut = new SlackConfirmationScheduledTask(dataContext, _slackClient, dateTimeProvider, _logger);
    }

    [Test]
    public async Task NoUsersWithBookingsOnThatDayIsANoop()
    {
        _slackClient.ClearReceivedCalls();
        
        var json =@"{""message"":""Hello, world!"",""dayOffset"":2}";
        
        var scheduleContext = new ScheduleContext(json);
        
        await _sut.RunTask(scheduleContext);
        
        await _slackClient.DidNotReceive().GetUserIdByEmail(Arg.Any<string>());
    }
    
    [Test]
    public async Task SendNotificationsToBookingsOnThatDay()
    {
        _slackClient.ClearReceivedCalls();
        
        var json =@"{""message"":""Hello, world!"",""dayOffset"":0}";
        
        var scheduleContext = new ScheduleContext(json);
        
        await _sut.RunTask(scheduleContext);
        
        await _slackClient.Received(1).GetUserIdByEmail("user1@test.com");
        await _slackClient.Received(1).GetUserIdByEmail("user2@test.com");
        
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack1"));
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack2"));
    }

    [Test]
    public async Task UserSkippedIfNotFoundInSlack()
    {
        _slackClient.ClearReceivedCalls();
        
        var json = @"{""message"":""Hello, world!"",""dayOffset"":1}";

        var scheduleContext = new ScheduleContext(json);

        await _sut.RunTask(scheduleContext);

        await _slackClient.Received(1).GetUserIdByEmail("user2@test.com");
        await _slackClient.Received(1).GetUserIdByEmail("user3@test.com");
        
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack2"));
        await _slackClient.Received(1).SendMessage(Arg.Any<Message>());
    }
}