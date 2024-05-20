using Hippo.Booking.Core.Entities.FloorPlanModels;

namespace Hippo.Booking.Core.Entities;

public class Office : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;
    
    public FloorPlan FloorPlan { get; set; } = null!;
}