namespace Hippo.Booking.Core.Entities;

public class Report : BaseEntity<int>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string ReportQuery { get; set; } = string.Empty;

    public string ParametersJson { get; set; } = string.Empty;
}