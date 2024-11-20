using FluentAssertions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SlackNet.Blocks;
using SlackNet.Interaction;
using User = SlackNet.User;

namespace Hippo.Booking.Infrastructure.Tests.Slack;

public class InteractionEventTests
{
    private InteractionEvent _sut;
    private ISlackClient _slackClient;
    private IDataContext _dataContext;
    private ILogger<InteractionEvent> _logger;

    [SetUp]
    public async Task Setup()
    {
        _slackClient = Substitute.For<ISlackClient>();
        _logger = Substitute.For<ILogger<InteractionEvent>>();

        _dataContext = TestHelpers.GetDbContext(nameof(InteractiveMessage) + Guid.NewGuid());
        
        _dataContext.AddEntity(new Core.Entities.Booking
        {
            Id = 1,
            BookableObjectId = 1,
            BookableObject = new()
            {
                Id = 1,
                Name = "test",
                Description = "test desc",
                BookableObjectTypeId = BookableObjectTypeEnum.Standard,
                AreaId = 0,
                Bookings = [],
            },
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "123",
        });

        await _dataContext.Save();

        _sut = new InteractionEvent(
            _slackClient,
            _dataContext,
            _logger);
    }

    [Test]
    public async Task HandleBookingNotFound()
    {
        var action = new ButtonAction
        {
            ActionId = "confirm_booking",
            Value = "2"
        };

        var request = new BlockActionRequest
        {
            User = new User
            {
                Id = "123"
            }
        };

        await _sut.Handle(action, request);
        
        var booking = await _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .SingleOrDefaultAsync(x => x.Id == 1);
        
        booking.Should().NotBeNull();
        booking!.IsConfirmed.Should().BeFalse("booking should not be confirmed as ID does not match");
    }

    [Test]
    public async Task HandleConfirmBooking()
    {
        var action = new ButtonAction
        {
            ActionId = "confirm_booking",
            Value = "1"
        };

        var request = new BlockActionRequest
        {
            User = new User
            {
                Id = "123"
            }
        };

        await _sut.Handle(action, request);
        
        var booking = await _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .Include(x => x.BookableObject)
            .SingleOrDefaultAsync(x => x.Id == 1);

        booking.Should().NotBeNull();
        booking!.IsConfirmed.Should().BeTrue("booking should be confirmed as ID matches");
        booking!.BookableObject.Should().NotBeNull();
    }

    [Test]
    public async Task HandleCancelBooking()
    {
        var action = new ButtonAction
        {
            ActionId = "cancel_booking",
            Value = "1"
        };

        var request = new BlockActionRequest
        {
            User = new User
            {
                Id = "123"
            }
        };

        await _sut.Handle(action, request);

        var booking = await _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .SingleOrDefaultAsync(x => x.Id == 1);

        booking.Should().BeNull();
    }

    [Test]
    public async Task HandleInvalidAction()
    {
        var action = new ButtonAction
        {
            ActionId = "dfdsfsdf",
            Value = "1"
        };

        var request = new BlockActionRequest
        {
            User = new User
            {
                Id = "123"
            }
        };

        await _sut.Handle(action, request);

        var booking = await _dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
            .SingleOrDefaultAsync(x => x.Id == 1);
        
        booking.Should().NotBeNull();
        booking!.IsConfirmed.Should().BeFalse("booking should not be touched as action is invalid");
    }
}