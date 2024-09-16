using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Hippo.Booking.Core.Extensions;
using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.Infrastructure.Configuration;

// https://aws.amazon.com/blogs/modernizing-with-aws/how-to-load-net-configuration-from-aws-secrets-manager/

public class AwsSecretsManagerConfigurationProvider(string region, string secretName) : ConfigurationProvider
{
    public override void Load()
    {
        var secret = GetSecret();

        Data = secret.FromJson<Dictionary<string, string?>>() ?? new Dictionary<string, string?>();
    }
    
    private string GetSecret()
    {
        var request = new GetSecretValueRequest
        {
            SecretId = secretName,
            VersionStage = "AWSCURRENT" // VersionStage defaults to AWSCURRENT if unspecified.
        };

        using (var client = 
               new AmazonSecretsManagerClient(RegionEndpoint.GetBySystemName(region)))
        {
            var response = client.GetSecretValueAsync(request).Result;

            string secretString;
            if (response.SecretString != null)
            {
                secretString = response.SecretString;
            }
            else
            {
                var memoryStream = response.SecretBinary;
                var reader = new StreamReader(memoryStream);
                secretString = 
                    System.Text.Encoding.UTF8
                        .GetString(Convert.FromBase64String(reader.ReadToEnd()));
            }

            return secretString;
        }
    }
}