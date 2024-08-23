using System.Text.Json;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Application.Commands.Reports;

public interface IReportRunner
{
    Task<ReportResponse> RunReport(Report report, Dictionary<string, JsonElement> parameters);
}