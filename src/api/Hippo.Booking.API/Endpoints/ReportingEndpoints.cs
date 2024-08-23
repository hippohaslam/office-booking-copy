using System.Text.Json;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Application.Queries.Reports;
using Hippo.Booking.Core.Enums;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.API.Endpoints;

public class ReportingEndpoints() : EndpointBase("reporting", "Reporting", AccessLevelEnum.Admin)
{
    protected override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async (IReportQueries reportQueries) =>
        {
            var reports = await reportQueries.GetReportList();
            return TypedResults.Ok(reports);
        });

        builder.MapGet("{reportId}",
            async Task<Results<Ok<RunReportResponse>, NotFound>> (IReportQueries reportQueries, int reportId) =>
            {
                var report = await reportQueries.GetReportById(reportId);

                if (report == null)
                {
                    return TypedResults.NotFound();
                }

                return TypedResults.Ok(report);
            });

        builder.MapPost("{reportId}/run",
            async Task<Results<Ok<List<object>>, BadRequest>> (
                IRunReportCommand runReportCommand, 
                int reportId, 
                [FromBody] Dictionary<string, JsonElement> parameters) =>
            {
                var reportResponse = await runReportCommand.RunReportAsync(reportId, parameters);

                if (!reportResponse.Success)
                {
                    return TypedResults.BadRequest();
                }

                // Run the report
                return TypedResults.Ok(reportResponse.Response);
            });
    }
}