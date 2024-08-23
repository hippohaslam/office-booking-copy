using System.Text.Json;

namespace Hippo.Booking.Application.Commands.Reports;

public interface IReportRunner
{
    Task<ReportResponse> RunReport(string reportQuery, Dictionary<string, JsonElement> parameters);
}