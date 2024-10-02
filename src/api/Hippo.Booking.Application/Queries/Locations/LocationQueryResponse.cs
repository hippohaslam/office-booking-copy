using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Locations;

public class LocationQueryResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string SlackChannel { get; set; } = string.Empty;
    public string GuideLink { get; set; } = string.Empty;
    
    public List<IdName<int>> Areas { get; set; } = new();
}