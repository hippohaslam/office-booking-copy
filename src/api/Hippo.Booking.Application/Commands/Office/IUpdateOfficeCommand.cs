namespace Hippo.Booking.Application.Commands.Office;

public interface IUpdateOfficeCommand
{
    Task Handle(int id, UpdateOfficeRequest request);
}