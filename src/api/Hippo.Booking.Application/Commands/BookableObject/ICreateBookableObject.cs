namespace Hippo.Booking.Application.Commands.BookableObject;

public interface ICreateBookableObject
{
    Task<int> Handle(int locationId, int areaId, CreateBookableObjectRequest request);
}