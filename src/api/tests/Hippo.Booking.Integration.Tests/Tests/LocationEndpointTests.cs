using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Queries.Locations;
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
    
    [OneTimeSetUp]
    public async Task LocationEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "locationtestuser",
            FirstName = "Location",
            LastName = "User",
            Email = "locationtestuser@hippodigital.co.uk"
        });
    }

    [Test]
    public async Task GetLocationsShouldReturnAllExistingLocationsSuccessfully()
    {
        //Arrange
        var client = GetClient();
        await SetUpLocation("Location Test location 2");
        await SetUpLocation("Location Test Location 3");
        await SetUpLocation("Location Test Location 4");
        
        //Act
        var response = await client.GetAsync("location");
        
        //Assert
        response.EnsureSuccessStatusCode();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseLocations = JsonSerializer.Deserialize<List<LocationQueryResponse>>(responseContent, new JsonSerializerOptions 
        {
            PropertyNameCaseInsensitive = true
        });
        var dbLocations = DbContext.Locations.ToList();
        var expectedLocations = dbLocations.Select(l => new LocationQueryResponse {Id = l.Id, Name = l.Name}).ToList();

        responseLocations.Should()
            .BeEquivalentTo(expectedLocations, "the returned locations should match the existing locations");
    }

    [Test]
    public async Task GetLocationShouldReturnLocationSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var locations = new List<Location>
        {
            await SetUpLocation("Location Test location 5"),
            await SetUpLocation("Location Test Location 6"),
            await SetUpLocation("Location Test Location 7")
        };
        
        //Act
        var response = await client.GetAsync("location/" + locations.First().Id);
        
        //Assert
        response.EnsureSuccessStatusCode();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseLocation = JsonSerializer.Deserialize<LocationQueryResponse>(responseContent, new JsonSerializerOptions 
        {
            PropertyNameCaseInsensitive = true
        });
        
        responseLocation.Should().BeEquivalentTo(new LocationQueryResponse
            {
                Id = locations.First().Id, 
                Name = locations.First().Name
            },
            "the correct location should be returned");
    }
}