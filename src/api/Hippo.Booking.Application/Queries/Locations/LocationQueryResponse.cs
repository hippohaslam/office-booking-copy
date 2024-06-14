using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Locations;

public class LocationQueryResponse
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string FloorPlanJson { get; set; } = string.Empty;

    public List<BookableObjectDto> BookableObjects { get; set; } = new();

    
}