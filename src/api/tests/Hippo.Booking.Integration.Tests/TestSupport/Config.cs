using System.Reflection;
using Microsoft.Extensions.Configuration;

namespace Hippo.Booking.Integration.Tests.TestSupport;

public class Config
{
    private static IConfiguration? _configuration;

    private static IConfiguration Instance => _configuration ??= new ConfigurationBuilder()
        .AddJsonFile("appsettings.json", optional: false)
        .AddUserSecrets(Assembly.GetExecutingAssembly(), optional: true)
        .Build();

    public static string DatabaseConnectionString => Instance.GetConnectionString("HippoBookingDbContext") ??
                                                     throw new InvalidOperationException(
                                                         "Database connection string requires a value. Please check appsettings and/or secrets");
}