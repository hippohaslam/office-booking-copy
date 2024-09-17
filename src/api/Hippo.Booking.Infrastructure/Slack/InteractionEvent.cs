using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SlackNet.Blocks;
using SlackNet.Interaction;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Slack;

public class InteractionEvent(
    ISlackClient slackClient,
    IDataContext dataContext,
    ILogger<InteractionEvent> logger) : IBlockActionHandler<ButtonAction>
{
    public async Task Handle(ButtonAction action, BlockActionRequest request)
    {
        var bookingId = int.Parse(action.Value);

        var booking = await dataContext.Query<Core.Entities.Booking>()
            .SingleOrDefaultAsync(x => x.Id == bookingId);

        if (booking == null)
        {
            logger.LogWarning("Booking {BookingId} not found. User: {User}", bookingId, request.User);
            await slackClient.RespondToInteraction(request.ResponseUrl, new MessageResponse
            {
                ReplaceOriginal = true,
                Message = new Message
                {
                    Text = "Your booking was not found. It may have already been cancelled."
                }
            });
            return;
        }

        if (action.ActionId == "confirm_booking")
        {
            logger.LogDebug("Booking {BookingId} confirmed by {User} via Slack", bookingId, request.User);

            booking.IsConfirmed = true;
            await dataContext.Save();

            await slackClient.RespondToInteraction(request.ResponseUrl, new MessageResponse
            {
                ReplaceOriginal = true,
                Message = new Message
                {
                    Text = "You have confirmed your booking!"
                }
            });
        }
        else if (action.ActionId == "cancel_booking")
        {
            logger.LogDebug("Booking {BookingId} cancelled by {User} via Slack", bookingId, request.User);
            
            dataContext.DeleteEntity(booking);
            await dataContext.Save();
            
            await slackClient.RespondToInteraction(request.ResponseUrl, new MessageResponse
            {
                ReplaceOriginal = true,
                Message = new Message
                {
                    Text = "You have cancelled your booking! If you wish to re-book, you must do so via the portal."
                }
            });
        }
        else
        {
            logger.LogWarning("Unknown action sent from Slack. User: {0}", request.User);
            await slackClient.RespondToInteraction(request.ResponseUrl, new MessageResponse
            {
                Message = new Message
                {
                    Text = "Something went wrong when confirming your booking. Please try again."
                }
            });
        }
    }
}