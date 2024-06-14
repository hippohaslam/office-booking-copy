namespace Hippo.Booking.Application.Commands.Location;

public interface ICreateLocationCommmand
{
    Task<int> Handle(CreateLocationRequest request);
}