using Amazon;
using Amazon.CloudWatchLogs;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.AwsCloudWatch;

namespace Hippo.Booking.API.Extensions;

public static class LoggerConfigurationExtensions
{
    public static AmazonCloudWatchLogsClient? client = null;

    public static LoggerConfiguration ConfigureLogging(this LoggerConfiguration loggerConfig, string? awsAccessKey, string? awsAccessSecret)
    {
        return loggerConfig
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .MinimumLevel.Override("EntityFrameworkCore", LogEventLevel.Information)
            .ConfigureAwsLogging(
                awsAccessKey,
                awsAccessSecret,
                RegionEndpoint.EUWest1)
            .Filter.ByExcluding(x =>
                x.Properties.Any(y => y.Key == "RequestPath" && y.Value.ToString().Contains("/health")))
            .WriteTo.Console()
            .Enrich.FromLogContext();
    }

    public static LoggerConfiguration ConfigureAwsLogging(
        this LoggerConfiguration configuration,
        string? accessKey,
        string? secretKey,
        RegionEndpoint region)
    {
        if (string.IsNullOrEmpty(accessKey) || string.IsNullOrEmpty(secretKey))
        {
            return configuration;
        }

        client ??= new AmazonCloudWatchLogsClient(accessKey, secretKey, region);

        return configuration
            .WriteTo.AmazonCloudWatch(
                logGroup: "/dotnet/hippo-booking-logging-demo/serilog",
                logStreamPrefix: DateTime.UtcNow.ToString("yyyyMMddHHmmssfff"),
                cloudWatchClient: client);
    }
    
    public static bool IsHealthCheckEndpoint(this HttpContext ctx)
    {
        var endpoint = ctx.GetEndpoint();
        if (endpoint is object) // same as !(endpoint is null)
        {
            return string.Equals(
                endpoint.DisplayName, 
                "Health checks",
                StringComparison.Ordinal);
        }
        // No endpoint, so not a health check endpoint
        return false;
    }
}