using Hippo.Booking.Application.Queries.Users;
using Hippo.Booking.Core.Models;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.Extensions.Logging;
using NSubstitute;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Tests.Slack;

public class SlackUserNotifierTests
{
    private SlackUserNotifier _sut;
    private ISlackClient _slackClient;
    private IUserQueries _userQueries;
    private ILogger<SlackUserNotifier> _logger;
    private RegisteredUserModel _user;
    
    [SetUp]
    public void Setup()
    {
        _slackClient = Substitute.For<ISlackClient>();
        _userQueries = Substitute.For<IUserQueries>();
        _logger = Substitute.For<ILogger<SlackUserNotifier>>();

        _user = new RegisteredUserModel
        {
            UserId = "123",
            Email = "test@test.com"
        };

        _userQueries.GetUserById("123").Returns(_user);

        _sut = new SlackUserNotifier(_slackClient, _userQueries, _logger);
    }
    
    [Test]
    public async Task UserNotifyUserNotFound()
    {
        var userId = "1234";
        var message = "Hello";
        
        await _sut.NotifyUser(userId, message);

        await _userQueries.Received(1).GetUserById(userId);
        await _slackClient.DidNotReceive().GetUserIdByEmail(Arg.Any<string>());
    }
    
    [Test]
    public async Task UserNotifyUserNotFoundOnSlack()
    {
        var userId = "123";
        var message = "Hello";
        
        await _sut.NotifyUser(userId, message);

        await _userQueries.Received(1).GetUserById(userId);
        await _slackClient.Received(1).GetUserIdByEmail(_user.Email);
        await _slackClient.DidNotReceive().SendMessage(Arg.Any<Message>());
    }
    
    [Test]
    public async Task UserNotifyUserOnSlackSuccessful()
    {
        var userId = "123";
        var message = "Hello";
        
        _slackClient.GetUserIdByEmail(_user.Email).Returns("testslack");
        
        await _sut.NotifyUser(userId, message);

        await _userQueries.Received(1).GetUserById(userId);
        await _slackClient.Received(1).GetUserIdByEmail(_user.Email);
        await _slackClient.Received(1).SendMessage(Arg.Is<Message>(x => x.Channel == "testslack"));
    }
}