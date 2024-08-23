using System.Text.Json;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Infrastructure.Reports;

public class NullReportRunner : IReportRunner
{
    public Task<ReportResponse> RunReport(Report report, Dictionary<string, JsonElement> parameters)
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