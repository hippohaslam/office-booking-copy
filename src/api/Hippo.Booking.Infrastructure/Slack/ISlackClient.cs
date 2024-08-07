using SlackNet.Interaction;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Slack;

public interface ISlackClient
{
    Task<string?> GetUserIdByEmail(string email, CancellationToken ct = default);

    Task RespondToInteraction(
        string responseUrl,
        MessageResponse responseMessage,
        CancellationToken ct = default);

    Task SendMessage(Message slackMessage, CancellationToken ct = default);
}