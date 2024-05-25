namespace Hippo.Booking.Application.Queries.Offices;

public class OfficeQueryResponse
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string FloorPlanJson { get; set; } = string.Empty;
}