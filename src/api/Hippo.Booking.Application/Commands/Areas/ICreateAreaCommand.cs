namespace Hippo.Booking.Application.Commands.Areas;

public interface ICreateAreaCommand
{
    Task<int> Handle(int locationId, CreateAreaRequest request);
}