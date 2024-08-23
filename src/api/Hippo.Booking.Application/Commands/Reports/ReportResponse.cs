namespace Hippo.Booking.Application.Commands.Reports;

public class ReportResponse
{
    public bool Success { get; set; }
    
    public required List<object> Response { get; set; }
}