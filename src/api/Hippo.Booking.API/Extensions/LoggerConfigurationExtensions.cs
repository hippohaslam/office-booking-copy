using Amazon;
using Amazon.CloudWatchLogs;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.AwsCloudWatch;

namespace Hippo.Booking.API.Extensions;

public static class LoggerConfigurationExtensions
{
    public static AmazonCloudWatchLogsClient? Client = null;

    public static LoggerConfiguration ConfigureLogging(
        this LoggerConfiguration loggerConfig,
        string environment,
        bool useCloudWatch = false)
    {
        var config = loggerConfig
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning)
            .MinimumLevel.Override("EntityFrameworkCore", LogEventLevel.Information)
            .Filter.ByExcluding(x =>
                x.Properties.Any(y => y.Key == "RequestPath" && y.Value.ToString().Contains("/health")))
            .WriteTo.Console()
            .Enrich.FromLogContext();


        if (useCloudWatch)
        {
            Client = new AmazonCloudWatchLogsClient();

            var logGroup = "booking/" + environment.ToLower() + "/logs";

            config = config.WriteTo.AmazonCloudWatch(
                logGroup: logGroup,
                logStreamPrefix: DateTime.UtcNow.ToString("yyyyMMddHHmmssfff"),
                cloudWatchClient: Client);
        }

        return config;
    }
}