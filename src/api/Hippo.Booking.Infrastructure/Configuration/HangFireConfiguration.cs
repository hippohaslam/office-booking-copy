using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Hippo.Booking.Infrastructure.Configuration;

public static class HangFireConfiguration
{
    public static void AddCustomHangfire(this IServiceCollection service, string hangfireConnectionString)
    {
        if (string.IsNullOrWhiteSpace(hangfireConnectionString))
        {
            throw new InvalidOperationException("Hangfire connection string not found");
        }
    
        EnsureHangfireDatabaseExistsTask(hangfireConnectionString);
        
        service.AddHangfire(cfg =>
        {
            cfg.UseRecommendedSerializerSettings()
                .UseSimpleAssemblyNameTypeSerializer()
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UsePostgreSqlStorage(pgCfg =>
                {
                    pgCfg.UseNpgsqlConnection(hangfireConnectionString);
                });
        });
    
        service.AddHangfireServer();
    }
    
    public static void EnsureHangfireDatabaseExistsTask(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var databaseName = builder.Database;
        builder.Database = "postgres"; // Connect to the default database to check for the existence of the target database

        using var connection = new NpgsqlConnection(builder.ConnectionString);
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText = $"SELECT 1 FROM pg_database WHERE datname = '{databaseName}'";
        var exists = command.ExecuteScalar() != null;

        if (!exists)
        {
            command.CommandText = $"CREATE DATABASE \"{databaseName}\"";
            command.ExecuteNonQuery();
        }
    }
}