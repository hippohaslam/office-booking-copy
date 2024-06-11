namespace Hippo.Booking.Application.Commands.Office;

public interface ICreateOfficeCommmand
{
    Task<int> Handle(CreateOfficeRequest request);
}