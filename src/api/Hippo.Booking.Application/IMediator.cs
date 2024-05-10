namespace Hippo.Booking.Application;

public interface IMediator
{
    Task Execute<TRequest>(TRequest request);
    
    Task<TResponse> Execute<TRequest, TResponse>(TRequest request);
}