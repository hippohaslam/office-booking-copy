using System.Text.Json;

namespace Hippo.Booking.Application.Commands.Reports;

public interface IRunReportCommand
{
    Task<ReportResponse> RunReportAsync(int reportId, Dictionary<string, JsonElement> parametersJson);
}