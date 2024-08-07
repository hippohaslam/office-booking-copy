using Dapper;
using Hippo.Booking.Integration.Tests.TestSupport;
using Microsoft.Data.SqlClient;

namespace Hippo.Booking.Integration.Tests.Drivers;

public class DbDriver
{
    public async Task<IEnumerable<T>> ReadTable<T>(string table, string? where = null)
    {
        using (var db = new SqlConnection(Config.DatabaseConnectionString))
        {
            string whereQuery = where != null ? $"where {where}" : "";
            return await db.QueryAsync<T>($"select * from {table} {whereQuery}");
        }
    }

    public async Task Execute(string sqlQuery)
    {
        using (var db = new SqlConnection(Config.DatabaseConnectionString))
        {
            await db.ExecuteAsync(sqlQuery);
        }
    }
}