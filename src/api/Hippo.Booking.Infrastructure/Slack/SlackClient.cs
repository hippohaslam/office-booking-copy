using SlackNet;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Slack;

public class SlackClient(ISlackApiClient slackApiClient)
{
    public async Task<string?> GetUserIdByEmail(string email, CancellationToken ct = default)
    {
        try
        {
            var user = await slackApiClient.Users.LookupByEmail(email);

            return user?.Id;
        }
        catch (SlackException e)
        {
            if (e.ErrorCode == "users_not_found")
            {
                return null;
            }

            throw;
        }
    }

    public async Task SendMessage(Message slackMessage)
    {
        try
        {
            await slackApiClient.Chat.PostMessage(slackMessage);
        }
        catch (SlackException e)
        {
            if (e.ErrorCode == "channel_not_found")
            {
                return;
            }

            throw;
        }
    }
}