namespace Hippo.Booking.Core.Interfaces;

public interface ICreatedBy
{
    DateTime CreatedAt { get; set; }
    
    string CreatedBy { get; set; }
}