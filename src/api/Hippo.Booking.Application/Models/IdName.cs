namespace Hippo.Booking.Application.Models;

public class IdName<TId> where TId : struct
{
    public TId Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
}