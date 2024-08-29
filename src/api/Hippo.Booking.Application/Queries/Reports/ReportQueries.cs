using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Application.Queries.Reports;

public class ReportQueries(IDataContext dataContext) : IReportQueries
{
    public Task<List<ReportListResponse>> GetReportList()
    {
        return dataContext.Query<Report>(x => x.WithNoTracking())
            .Select(x => new ReportListResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .ToListAsync();
    }

    public Task<RunReportResponse?> GetReportById(int reportId)
    {
        return dataContext.Query<Report>(x => x.WithNoTracking())
            .Where(x => x.Id == reportId)
            .Select(x => new RunReportResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                ParameterJson = x.ParametersJson
            })
            .SingleOrDefaultAsync();
    }
}