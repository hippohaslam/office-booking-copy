using System.Text.Json;
using Dapper;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hippo.Booking.Infrastructure.Reports;

public class PostgresReportRunner(IConfiguration configuration, ILogger<PostgresReportRunner> logger) : IReportRunner
{
    public async Task<ReportResponse> RunReport(string reportQuery, Dictionary<string, JsonElement> parameters)
    {
        try
        {
            await using var postgresSqlConnection = new NpgsqlConnection(configuration.GetConnectionString("HippoBookingDbContext"));
            
            logger.LogInformation("Running report: {reportQuery} with parameters {parameters}", reportQuery, parameters);
            
            var dynamicParameters = new DynamicParameters();
            foreach (var parameter in parameters)
            {
                switch (parameter.Value.ValueKind)
                {
                    case JsonValueKind.String:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetString());
                        break;
                    case JsonValueKind.Number:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetInt32());
                        break;
                    case JsonValueKind.True:
                        dynamicParameters.Add(parameter.Key, true);
                        break;
                    case JsonValueKind.False:
                        dynamicParameters.Add(parameter.Key, false);
                        break;
                    default:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetString());
                        break;
                }
            }

            var response = await postgresSqlConnection.QueryAsync(reportQuery, dynamicParameters);
            
            return new ReportResponse
            {
                Success = true,
                Response = response.ToList()
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error running report");
            
            return new ReportResponse
            {
                Success = false,
                Response =
                [
                    new
                    {
                        Error = ex.Message
                    }
                ]
            };
        }
    }
}