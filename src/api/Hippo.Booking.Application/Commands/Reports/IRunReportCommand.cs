using System.Text.Json;

namespace Hippo.Booking.Application.Commands.Reports;

public interface IRunReportCommand
{
    Task<ReportResponse> Handle(int reportId, Dictionary<string, JsonElement> parametersJson);
}