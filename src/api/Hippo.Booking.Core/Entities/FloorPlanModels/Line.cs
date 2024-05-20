namespace Hippo.Booking.Core.Entities.FloorPlanModels;

public record Line
{
    public int X1 { get; set; }
    
    public int Y1 { get; set; }
    
    public int X2 { get; set; }
    
    public int Y2 { get; set; }
    
    public string Color { get; set; } = string.Empty;
}