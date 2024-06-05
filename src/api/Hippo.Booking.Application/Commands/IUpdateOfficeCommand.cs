using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands;

public interface IUpdateOfficeCommand
{
    Task Handle(int id, UpdateOfficeRequest request);
}