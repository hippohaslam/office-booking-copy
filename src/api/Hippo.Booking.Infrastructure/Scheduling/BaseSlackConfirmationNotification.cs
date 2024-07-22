using Hippo.Booking.Infrastructure.Slack;
using SlackNet.Blocks;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Scheduling;

public abstract class BaseSlackConfirmationNotification(SlackClient slackClient)
{
    protected SlackClient SlackClient => slackClient;
    
    public async Task SendConfirmationMessage(string messageTitleMarkdown, string location, string userId)
    {
        var message = new Message
        {
            Channel = userId,
            Blocks = new List<Block>
            {
                new SectionBlock()
                {
                    Text = new Markdown(messageTitleMarkdown),
                },
                new SectionBlock()
                {
                    Text = new Markdown($"You have booked: *{location}*"),
                },
                new SectionBlock()
                {
                    Text = new Markdown("Please confirm if you still require this booking"),
                },
                new ActionsBlock()
                {
                    Elements = new List<IActionElement>()
                    {
                        new Button()
                        {
                            Text = new PlainText("Confirm"),
                            Style = ButtonStyle.Primary,
                            ActionId = "confirm_booking"
                        },
                        new Button()
                        {
                            Text = new PlainText("Cancel"),
                            Style = ButtonStyle.Danger,
                            ActionId = "cancel_booking"
                        }
                    }
                }
            }
        };

        await SlackClient.SendMessage(message);
    }
}