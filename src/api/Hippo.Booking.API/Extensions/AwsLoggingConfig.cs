using Amazon;

namespace Hippo.Booking.API.Extensions;

public class AwsLoggingConfig
{
    public required string AccessKeyId { get; set; }

    public required string AccessSecretKey { get; set; }

    public required string EnvironmentName { get; set; }

    public string LogGroup => $"booking/{EnvironmentName.ToLower()}/logs";

    public RegionEndpoint Region => RegionEndpoint.EUWest1;

    public static AwsLoggingConfig? FromWebApplicationBuilder(IHostApplicationBuilder builder)
    {
        var accessKeyId = builder.Configuration.GetValue<string>("Aws:AccessKeyId");
        var accessSecret = builder.Configuration.GetValue<string>("Aws:AccessSecretKey");
        var environment = builder.Environment.EnvironmentName;
        
        if (string.IsNullOrEmpty(accessKeyId) || string.IsNullOrEmpty(accessSecret) || string.IsNullOrEmpty(environment))
        {
            return null;
        }

        return new AwsLoggingConfig
        {
            AccessKeyId = accessKeyId,
            AccessSecretKey = accessSecret,
            EnvironmentName = environment
        };
    }
    
    public static AwsLoggingConfig? FromEnvironmentVariables()
    {
        var accessKeyId = Environment.GetEnvironmentVariable("Aws__AccessKeyId");
        var accessSecret = Environment.GetEnvironmentVariable("Aws__AccessSecretKey");
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        
        if (string.IsNullOrEmpty(accessKeyId) || string.IsNullOrEmpty(accessSecret) || string.IsNullOrEmpty(environment))
        {
            return null;
        }

        return new AwsLoggingConfig
        {
            AccessKeyId = accessKeyId,
            AccessSecretKey = accessSecret,
            EnvironmentName = environment
        };
    }
}