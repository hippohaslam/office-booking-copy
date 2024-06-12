namespace Hippo.Booking.Application.Commands.BookableObject;

public interface ICreateBookableObject
{
    Task<int> Handle(int officeId, CreateBookableObjectRequest request);
}

public interface IUpdateBookableObject
{
    Task Handle(int bookableObjectId, int officeId, UpdateBookableObjectRequest request);
}