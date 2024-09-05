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

    Task<PostMessageResponse?> SendMessage(Message slackMessage, CancellationToken ct = default);
    
    Task DeleteMessage(string ts, string channel, CancellationToken ct = default);
}