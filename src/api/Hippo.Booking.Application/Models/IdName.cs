namespace Hippo.Booking.Application.Models;

public class IdName<TId> where TId : struct
{
    public IdName(TId id, string name)
    {
        Id = id;
        Name = name;
    }
    
    public TId Id { get; }
    
    public string Name { get; }
}