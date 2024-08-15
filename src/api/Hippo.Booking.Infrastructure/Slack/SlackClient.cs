using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.Options;
using SlackNet;
using SlackNet.Interaction;
using SlackNet.WebApi;
using MessageUpdateResponse = SlackNet.Interaction.MessageUpdateResponse;

namespace Hippo.Booking.Infrastructure.Slack;

[ExcludeFromCodeCoverage(Justification = "Can't test as it relies on Slack API")]
public class SlackClient(IOptions<SlackSettings> slackOptions, ISlackApiClient slackApiClient) : ISlackClient
{
    private readonly SlackSettings _slackSettings = slackOptions.Value;

    public async Task<string?> GetUserIdByEmail(string email, CancellationToken ct = default)
    {
        try
        {
            var user = await slackApiClient.Users.LookupByEmail(email, ct);

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

    public async Task RespondToInteraction(
        string responseUrl,
        MessageResponse responseMessage,
        CancellationToken ct = default)
    {
        try
        {
            await slackApiClient.Respond(
                responseUrl,
                new MessageUpdateResponse(responseMessage),
                ct);
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

    public async Task SendMessage(Message slackMessage, CancellationToken ct = default)
    {
        try
        {
            await slackApiClient.Chat.PostMessage(slackMessage, ct);
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