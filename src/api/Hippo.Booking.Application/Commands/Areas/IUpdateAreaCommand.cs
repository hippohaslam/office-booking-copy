namespace Hippo.Booking.Application.Commands.Areas;

public interface IUpdateAreaCommand
{
    Task Handle(int locationId, int id, UpdateAreaRequest request);
}