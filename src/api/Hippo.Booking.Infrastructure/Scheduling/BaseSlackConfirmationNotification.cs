using Hippo.Booking.Infrastructure.Slack;
using SlackNet.Blocks;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Scheduling;

public abstract class BaseSlackConfirmationNotification(ISlackClient slackClient)
{
    protected ISlackClient SlackClient => slackClient;

    public async Task<string> SendConfirmationMessage(
        string messageTitleMarkdown, 
        string location, 
        string userId, 
        int bookingId,
        bool canConfirm)
    {
        var buttons = new List<IActionElement>();

        if (canConfirm)
        {
            buttons.Add(new Button
            {
                Text = new PlainText("Confirm"),
                Style = ButtonStyle.Primary,
                ActionId = "confirm_booking",
                Value = bookingId.ToString()
            });
        }
        
        buttons.Add(new Button
        {
            Text = new PlainText("Cancel"),
            Style = ButtonStyle.Danger,
            ActionId = "cancel_booking",
            Value = bookingId.ToString()
        });
        
        var message = new Message
        {
            Channel = userId,
            Blocks = new List<Block>
            {
                new SectionBlock
                {
                    Text = new Markdown(messageTitleMarkdown),
                },
                new SectionBlock
                {
                    Text = new Markdown($"You have booked: *{location}*"),
                },
                new ActionsBlock
                {
                    Elements = buttons
                }
            }
        };

        var messageResponse = await SlackClient.SendMessage(message);
        return messageResponse?.Ts ?? string.Empty;
    }
}