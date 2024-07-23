using Hippo.Booking.Integration.Tests.Drivers;
using Hippo.Booking.Integration.Tests.Models;

namespace Hippo.Booking.Integration.Tests.Tests;

public class ExampleTest : IntegrationTestBase
{
    [SetUp]
    public void Setup()
    {
        GetClient();
    }

    [Test]
    public async Task Test1()
    {
        var db = new DbDriver();
        var result = await db.ReadTable<Location>("Locations", "Id = '1'");
    }
}