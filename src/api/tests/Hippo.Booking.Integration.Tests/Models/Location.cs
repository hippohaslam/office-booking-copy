namespace Hippo.Booking.Integration.Tests.Models;

public class Location
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}