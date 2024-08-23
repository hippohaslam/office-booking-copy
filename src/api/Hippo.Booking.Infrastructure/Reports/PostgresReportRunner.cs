using System.Text.Json;
using Dapper;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace Hippo.Booking.Infrastructure.Reports;

public class PostgresReportRunner(IConfiguration configuration, ILogger<PostgresReportRunner> logger) : IReportRunner
{
    public async Task<ReportResponse> RunReport(Report report, Dictionary<string, JsonElement> parameters)
    {
        try
        {
            await using var postgresSqlConnection = new NpgsqlConnection(configuration.GetConnectionString("HippoBookingDbContext"));
            
            logger.LogInformation("Running report: {reportQuery} with parameters {parameters}", report.ReportQuery, parameters);
            
            var dynamicParameters = new DynamicParameters();

            var definitions = report.ParametersJson.FromJson<List<ReportingParameterDefinition>>() ?? [];
            
            foreach (var parameter in parameters)
            {
                var definition = definitions.SingleOrDefault(x => x.Id == parameter.Key)
                    ?? new ReportingParameterDefinition
                    {
                        Id = parameter.Key,
                        FieldType = FieldTypeEnum.Text
                    };

                switch (definition.FieldType)
                {
                    case FieldTypeEnum.Date:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetDateTime());
                        break;
                    case FieldTypeEnum.Number:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetDecimal());
                        break;
                    case FieldTypeEnum.Text:
                        dynamicParameters.Add(parameter.Key, parameter.Value.GetString());
                        break;
                    default:
                        throw new ArgumentOutOfRangeException();
                }
            }

            var response = await postgresSqlConnection.QueryAsync(report.ReportQuery, dynamicParameters);
            
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