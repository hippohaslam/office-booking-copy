namespace Hippo.Booking.Application.Commands.Location;

public interface IUpdateLocationCommand
{
    Task Handle(int id, UpdateLocationRequest request);
}