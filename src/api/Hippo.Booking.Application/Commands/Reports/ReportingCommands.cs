using System.Text.Json;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Commands.Reports;

public class ReportingCommands(IDataContext dataContext, IReportRunner reportRunner) : IRunReportCommand
{
    public async Task<ReportResponse> Handle(int reportId, Dictionary<string, JsonElement> parametersJson)
    {
        var report = await dataContext.Query<Report>()
            .SingleOrDefaultAsync(x => x.Id == reportId);
        
        if (report == null)
        {
            throw new ClientException($"Report id {reportId} not found");
        }
        
        var result = await reportRunner.RunReport(report, parametersJson);

        return result;
    }
}