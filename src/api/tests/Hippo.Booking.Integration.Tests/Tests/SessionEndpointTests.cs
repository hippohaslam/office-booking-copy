using System.Text.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Users;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class SessionEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task SessionEndpointReturnsTestUser()
    {
        var client = WebFixture.GetClient();
        var response = await client.GetAsync("/session");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var user = content.FromJson<RegisteredUserRequest>();

        user.Should().BeEquivalentTo(new RegisteredUserRequest
        {
            Email = "testuser@hippodigital.co.uk",
            FirstName = "Test",
            LastName = "User",
            UserId = "testuser"
        });
    }
}