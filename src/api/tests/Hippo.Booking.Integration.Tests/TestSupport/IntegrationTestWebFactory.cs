using Hippo.Booking.Infrastructure.EF;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSubstitute;

namespace Hippo.Booking.Integration.Tests.TestSupport;

public class IntegrationTestWebFactory : WebApplicationFactory<Program>
{
    public HippoBookingDbContext DbContext { get; private set; } = null!;

    public ISlackClient SlackClientMock { get; set; } = Substitute.For<ISlackClient>();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTest");
        base.ConfigureWebHost(builder);

        builder.ConfigureServices(services =>
        {
            // replace SlackClient
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(ISlackClient));

            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            services.AddScoped<ISlackClient>(x => SlackClientMock);
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        DbContext = host.Services.GetRequiredService<HippoBookingDbContext>();

        return host;
    }
}