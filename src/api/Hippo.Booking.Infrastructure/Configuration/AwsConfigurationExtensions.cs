using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.Infrastructure.Configuration;

public static class AwsConfigurationExtensions
{
    public static void AddAwsSecretsManager(this IConfigurationBuilder builder, string region, string secretName)
    {
        builder.Add(new AwsSecretsManagerConfigurationSource(region, secretName));
    }
}