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
        .AddUserSecrets(Assembly.GetExecutingAssembly(), optional: false)
#endif
        .Build();

    public static string BaseUrl => Instance.GetValue<string>("Urls:BaseUrl") ?? string.Empty;
    public static string UserEmail => Instance.GetValue<string>("User:Email") ?? string.Empty;
    public static string UserPassword => Instance.GetValue<string>("User:Password") ?? string.Empty;
    private static string DbConnectionString => Instance.GetValue<string>("ConnectionStrings:Database") ?? string.Empty;
    
    public static HippoBookingDbContext GetDbContext()
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseNpgsql(DbConnectionString)
            .Options;

        return new HippoBookingDbContext(dbOptions, new TestUserProvider(), new SystemDateTimeProvider());
    }
}