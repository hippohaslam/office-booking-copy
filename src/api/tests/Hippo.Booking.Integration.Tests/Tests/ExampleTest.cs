using Hippo.Booking.Integration.Tests.Drivers;
using Hippo.Booking.Integration.Tests.Models;

namespace Hippo.Booking.Integration.Tests.Tests;

public class ExampleTest
{
    [SetUp]
    public void Setup()
    {
        
    }

    [Test]
    public async Task Test1()
    {
        var db = new DbDriver();
        var result = await db.ReadTable<Location>("Locations", "Id = '1'");
    }
}