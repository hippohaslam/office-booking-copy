using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Application;

public class Mediator(IServiceProvider serviceProvider) : IMediator
{ 
    public async Task Execute<TRequest>(TRequest request)
    {
        var handler = serviceProvider.GetService<IHandler<TRequest>>();

        if (handler == null)
        {
            throw new NotImplementedException("Handler not found");
        }

        var validator = serviceProvider.GetService<IValidator<TRequest>>();

        if (validator != null)
        {
            await validator.ValidateAndThrowAsync(request);
        }

        await handler.Handle(request);
    }

    public async Task<TResponse> Execute<TRequest, TResponse>(TRequest request)
    {
        var handler = serviceProvider.GetService<IHandler<TRequest, TResponse>>();

        if (handler == null)
        {
            throw new NotImplementedException("Handler not found");
        }

        var validator = serviceProvider.GetService<IValidator<TRequest>>();

        if (validator != null)
        {
            await validator.ValidateAndThrowAsync(request);
        }

        return await handler.Handle(request);
    }
}
