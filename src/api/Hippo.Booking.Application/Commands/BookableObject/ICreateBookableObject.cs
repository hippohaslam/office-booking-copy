namespace Hippo.Booking.Application.Commands.BookableObject;

public interface ICreateBookableObject
{
    Task<int> Handle(int locationId, CreateBookableObjectRequest request);
}

public interface IUpdateBookableObject
{
    Task Handle(int bookableObjectId, int locationId, UpdateBookableObjectRequest request);
}