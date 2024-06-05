using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands;

public interface ICreateOfficeCommmand
{
    Task<int> Handle(CreateOfficeRequest request);
}