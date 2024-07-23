using System.Text.Json;
using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.Integration.Tests.Tests;

public class IntegrationTestBase
{
    public HttpClient GetClient() => WebFixture.GetClient();
    
    public HippoBookingDbContext DbContext => WebFixture.DbContext;
    
    public async Task<T> GetResponseContent<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        })!;
    }
    
    public async Task AddEntity<T>(T entity) where T : class
    {
        DbContext.Set<T>().Add(entity);
        await DbContext.SaveChangesAsync();
    }
    
    /*
     new Location
       {
           Name = "Test Location",
           Description = "Test"
       }
     */
}