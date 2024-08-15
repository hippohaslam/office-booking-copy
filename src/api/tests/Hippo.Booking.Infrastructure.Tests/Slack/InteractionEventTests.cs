using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SlackNet;
using SlackNet.Blocks;
using SlackNet.Interaction;

namespace Hippo.Booking.Infrastructure.Tests.Slack;

public class InteractionEventTests
{
    private InteractionEvent _sut;
    private ISlackClient _slackClient;
    private IDeleteBookingCommand _deleteBookingCommand;
    private IConfirmBookingCommand _confirmBookingCommand;
    private IBookingQueries _bookingQueries;
    private ILogger<InteractionEvent> _logger;
    
    [SetUp]
    public void Setup()
    {
        _slackClient = Substitute.For<ISlackClient>();
        _deleteBookingCommand = Substitute.For<IDeleteBookingCommand>();
        _confirmBookingCommand = Substitute.For<IConfirmBookingCommand>();
        _bookingQueries = Substitute.For<IBookingQueries>();
        _logger = Substitute.For<ILogger<InteractionEvent>>();

        _bookingQueries.GetBookingById(1).Returns(new BookingResponse
        {
            Id = 1
        });
        
        _sut = new InteractionEvent(
            _slackClient, 
            _deleteBookingCommand, 
            _confirmBookingCommand, 
            _bookingQueries, 
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
        
        await _bookingQueries.Received(1).GetBookingById(2);
        await _confirmBookingCommand.DidNotReceive().Handle(Arg.Any<int>());
        await _deleteBookingCommand.DidNotReceive().Handle(Arg.Any<DeleteBookingRequest>());
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
        
        await _bookingQueries.Received(1).GetBookingById(1);
        await _confirmBookingCommand.Received(1).Handle(1);
        await _deleteBookingCommand.DidNotReceive().Handle(Arg.Any<DeleteBookingRequest>());
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
        
        await _bookingQueries.Received(1).GetBookingById(1);
        await _confirmBookingCommand.DidNotReceive().Handle(Arg.Any<int>());
        await _deleteBookingCommand.Received(1).Handle(Arg.Is<DeleteBookingRequest>(x => x.BookingId == 1));
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
        
        await _bookingQueries.Received(1).GetBookingById(1);
        await _confirmBookingCommand.DidNotReceive().Handle(Arg.Any<int>());
        await _deleteBookingCommand.DidNotReceive().Handle(Arg.Is<DeleteBookingRequest>(x => x.BookingId == 1));
    }
}