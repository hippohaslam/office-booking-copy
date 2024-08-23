namespace Hippo.Booking.Application.Queries.Reports;

public class RunReportResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public string ParameterJson { get; set; } = string.Empty;
}