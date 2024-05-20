using System.Reflection;
using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.E2ETests.Support;

public class Config
{
    private static IConfiguration? _configuration;

    private static IConfiguration Instance => _configuration ??= new ConfigurationBuilder()
        
#if !DEBUG
                .AddJsonFile("appsettings.json", optional: false)
#else
        .AddJsonFile("appsettings.Development.json", optional: false)
        .AddUserSecrets(Assembly.GetExecutingAssembly(), optional: true)
#endif
        .Build();
    
    public static string BaseUrl => Instance.GetValue<string>("Urls:BaseUrl") ?? string.Empty;
}