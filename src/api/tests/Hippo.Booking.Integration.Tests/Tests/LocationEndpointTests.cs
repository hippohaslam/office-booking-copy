using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class LocationEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task CreatingANewUniqueLocationIsSuccessful()
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
    public async Task CreatingALocationWithTheSameNameReturns400()
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

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, "locations cannot share the same name");
        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Be("\"Location already exists\"", "locations cannot share the same name");
        
        var location = DbContext.Locations.Where(x => x.Name == "Test Location");
        location.Should().HaveCount(1, "the duplicate location should not have been added");
    }

    [Test]
    public async Task UpdatingExistingLocationIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Location Test Location 1");
        
        var updateLocation = new UpdateLocationRequest
        {
            Name = "Location Test Location 1 - updated",
            Description = "Location Test Location 1 - updated"
        };
        
        //Act
        var response = await client.PutAsJsonAsync("location/" + location.Id, updateLocation);
        
        //Assert
        response.EnsureSuccessStatusCode();
        
        var dbLocation = await DbContext.Locations
            .AsNoTracking()
            .SingleOrDefaultAsync(l => l.Id == location.Id);
        dbLocation.Should().BeEquivalentTo(new Location
        {
            Id = location.Id,
            Name = "Location Test Location 1 - updated",
            Description = "Location Test Location 1 - updated"
        }, "the updates to the location should be reflected in the database");
    }
}