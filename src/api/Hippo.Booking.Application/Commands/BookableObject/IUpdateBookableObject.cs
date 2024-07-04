namespace Hippo.Booking.Application.Commands.BookableObject;

public interface IUpdateBookableObject
{
    Task Handle(int bookableObjectId, int locationId, int areaId, UpdateBookableObjectRequest request);
}