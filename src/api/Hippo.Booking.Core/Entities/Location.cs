namespace Hippo.Booking.Core.Entities;

public class Location : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    
    public string Address { get; set; } = string.Empty;
    
    public string SlackChannel { get; set; } = string.Empty;
    
    public string GuideLink { get; set; } = string.Empty;

    public List<Area> Areas { get; set; } = new();
}