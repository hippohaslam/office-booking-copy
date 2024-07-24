using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Core.Entities;

namespace Hippo.Booking.Integration.Tests.Tests;

public class LocationEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task AddingANewUniqueLocationIsSuccessful()
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
        }, "the content from the request should be added to the database");
    }
    
    [Test]
    public async Task AddingALocationWithTheSameNameReturns400()
    {
        // Arrange
        var client = GetClient();
        await AddEntity(new Location
        {
            Name = "Test Location",
            Description = "Test Location"
        });
        var createLocation = new CreateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Location"
        };
        
        //Act
        var response = await client.PostAsJsonAsync("location", createLocation);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, "locations cannot share the same name");
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Be("\"Location already exists\"", "locations cannot share the same name");
        
        var location = DbContext.Locations.Where(x => x.Name == "Test Location");
        location.Should().HaveCount(1, "the duplicate location should not have been added");
    }
}