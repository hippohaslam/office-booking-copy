using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.Infrastructure.Configuration;

public class AwsSecretsManagerConfigurationSource(string region, string secretName) : IConfigurationSource
{
    public IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        return new AwsSecretsManagerConfigurationProvider(region, secretName);
    }
}