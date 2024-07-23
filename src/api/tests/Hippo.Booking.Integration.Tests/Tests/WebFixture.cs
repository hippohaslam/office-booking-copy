using Hippo.Booking.Infrastructure.EF;
using Hippo.Booking.Integration.Tests.TestSupport;

namespace Hippo.Booking.Integration.Tests.Tests;

[SetUpFixture]
public class WebFixture
{
    private static IntegrationTestWebFactory _webFactory = null!;

    [OneTimeSetUp]
    public void Setup()
    {
        _webFactory = new IntegrationTestWebFactory();
    }

    [OneTimeTearDown]
    public void Teardown()
    {
        _webFactory.Dispose();
    }

    public static HttpClient GetClient() => _webFactory.CreateClient();

    public static HippoBookingDbContext DbContext => _webFactory.DbContext;
}