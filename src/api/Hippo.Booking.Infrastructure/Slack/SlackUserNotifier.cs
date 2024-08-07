using Hippo.Booking.Application.Queries.Users;
using Hippo.Booking.Core.Interfaces;
using Microsoft.Extensions.Logging;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Slack;

public class SlackUserNotifier(
    ISlackClient slackClient, 
    IUserQueries userQueries,
    ILogger<SlackUserNotifier> logger) : IUserNotifier
{
    public async Task NotifyUser(string userId, string message)
    {
        var user = await userQueries.GetUserById(userId);
        
        if (user == null)
        {
            logger.LogError("User not found for id {UserId}", userId);
            return;
        }
        
        var slackUserId = await slackClient.GetUserIdByEmail(user.Email);
        
        if (slackUserId == null)
        {
            logger.LogError("Slack user not found for email {Email}", user.Email);
            return;
        }
        
        var slackMessage = new Message
        {
            Channel = slackUserId,
            Text = message
        };
        
        await slackClient.SendMessage(slackMessage);
        
        logger.LogInformation("Message sent to user {UserId}", userId);
    }
}