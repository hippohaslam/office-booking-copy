using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Hippo.Booking.Integration.Tests.TestSupport;

public class IntegrationSchemeProvider : AuthenticationSchemeProvider
{
    public IntegrationSchemeProvider(IOptions<AuthenticationOptions> options) : base(options)
    {
    }

    protected IntegrationSchemeProvider(
        IOptions<AuthenticationOptions> options,
        IDictionary<string, AuthenticationScheme> schemes) : base(options, schemes)
    {
    }

    public override Task<AuthenticationScheme?> GetSchemeAsync(string name)
    {
        return Task.FromResult(new AuthenticationScheme(name, name, typeof(IntegrationTestAuthHandler)))!;
    }
}