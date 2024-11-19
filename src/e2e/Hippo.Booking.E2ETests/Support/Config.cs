using System.Reflection;
using Hippo.Booking.Core;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.E2ETests.Support;

public class Config
{
    private static IConfiguration? _configuration;

    private static IConfiguration Instance => _configuration ??= new ConfigurationBuilder()
#if !DEBUG
        .AddJsonFile("appsettings.json", optional: false)
        .AddEnvironmentVariables()

#else
        .AddJsonFile("appsettings.Development.json", optional: false)
        .AddUserSecrets(Assembly.GetExecutingAssembly(), optional: true)
#endif
        .Build();

    public static string BaseUrl => Instance.GetValue<string>("Urls:BaseUrl") ?? string.Empty;
    public static string UserEmail => Instance.GetValue<string>("User:Email") ?? string.Empty;
    public static string UserPassword => Instance.GetValue<string>("User:Password") ?? string.Empty;
    public static string UserId => Instance.GetValue<string>("User:Id") ?? string.Empty;
    public static bool Headless => Instance.GetValue<bool>("Headless");
    public static string? PlaywrightS3Bucket => Instance.GetValue<string?>("PlaywrightS3Bucket");
    private static string DbConnectionString => Instance.GetValue<string>("ConnectionStrings:Database") ?? string.Empty;
    
    public static async Task<HippoBookingDbContext> GetDbContext()
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseNpgsql(DbConnectionString)
            .Options;

        var db = new HippoBookingDbContext(dbOptions, new TestUserProvider(), new SystemDateTimeProvider());

        var retries = 0;
        while (retries <= 10)
        {
            retries++;

            if (await db.Database.CanConnectAsync())
            {
                return db;
            }
            
            await Task.Delay(5000);
        }

        throw new InvalidOperationException("Could not connect to database");
    }
}