namespace Hippo.Booking.Application;

public interface IHandler<TRequest>
{
    Task Handle(TRequest request);
}

public interface IHandler<TRequest, TResponse>
{
    Task<TResponse> Handle(TRequest request);
}