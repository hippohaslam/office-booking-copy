using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands;

public class SiteCommands : IHandler<CreateSiteRequest>
{
    public Task Handle(CreateSiteRequest request)
    {
        Console.WriteLine("Hello");
        
        return Task.CompletedTask;
    }
}