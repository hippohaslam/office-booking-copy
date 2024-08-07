using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Queries.Bookings;
using Microsoft.Extensions.Logging;
using SlackNet.Blocks;
using SlackNet.Interaction;
using SlackNet.WebApi;

namespace Hippo.Booking.Infrastructure.Slack;

public class InteractionEvent(
    ISlackClient slackClient,
    IDeleteBookingCommand deleteBookingCommand,
    IBookingQueries bookingQueries,
    ILogger<InteractionEvent> logger) : IBlockActionHandler<ButtonAction>
{
    public async Task Handle(ButtonAction action, BlockActionRequest request)
    {
        var bookingId = int.Parse(action.Value);

        var booking = await bookingQueries.GetBookingById(bookingId);

        if (booking == null)
        {
            logger.LogWarning("Booking {BookingId} not found. User: {User}", bookingId, request.User);
            await RespondWithError(request.ResponseUrl);
            return;
        }

        if (action.ActionId == "confirm_booking")
        {
            logger.LogDebug("Booking {BookingId} confirmed by {User} via Slack", bookingId, request.User);
            //Confirm booking once this is a thing
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

            await deleteBookingCommand.Handle(new DeleteBookingRequest
            {
                AreaId = booking.AreaId,
                BookingId = booking.Id,
                UserId = booking.UserId
            });

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
            await RespondWithError(request.ResponseUrl);
        }
    }

    private async Task RespondWithError(string responseUrl)
    {
        await slackClient.RespondToInteraction(responseUrl, new MessageResponse
        {
            Message = new Message
            {
                Text = "Something went wrong when confirming your booking. Please try again."
            }
        });
    }
}