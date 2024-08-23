using System.Text.Json;
using Hippo.Booking.Application.Commands.Reports;

namespace Hippo.Booking.Infrastructure.Reports;

public class NullReportRunner : IReportRunner
{
    public Task<ReportResponse> RunReport(string reportQuery, Dictionary<string, JsonElement> parameters)
    {
        return Task.FromResult(new ReportResponse
        {
            Success = true,
            Response =
            [
                new
                {
                    Test = "Test"
                }
            ]
        });
    }
}