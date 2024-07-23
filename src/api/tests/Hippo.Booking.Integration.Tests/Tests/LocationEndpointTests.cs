using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Integration.Tests.Tests;

public class LocationEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task AddingLocationIsSuccessful()
    {
        // Arrange
        var client = GetClient();
        var createLocation = new CreateLocationRequest
        {
            Name = "Create Test Location",
            Description = "Test Location"
        };
        
        //Act
        
        var response = await client.PostAsJsonAsync("location", createLocation);

        // Assert
        response.EnsureSuccessStatusCode();

        var value = response.Headers.Location!.ToString().Split('/').Last();

        var location = DbContext.Locations.SingleOrDefault(x => x.Name == "Create Test Location");
        
        location.Should().NotBeNull();
        location.Should().BeEquivalentTo(new Location
        {
            Id = int.Parse(value),
            Name = "Create Test Location",
            Description = "Test Location"
        });
    }
}