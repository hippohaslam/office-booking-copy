namespace Hippo.Booking.Application.Queries.Reports;

public interface IReportQueries
{
    Task<List<ReportListResponse>> GetReportList();

    Task<RunReportResponse?> GetReportById(int reportId);
}