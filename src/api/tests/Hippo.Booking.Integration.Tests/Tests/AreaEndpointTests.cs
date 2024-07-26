using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Areas;
using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class AreaEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task CreatingNewUniqueAreaForExistingLocationIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 1");

        var createAreaRequest = new CreateAreaRequest
        {
            Name = "Test Area 1",
            Description = "Test Area 1"
        };

        //Act
        var response = await client.PostAsJsonAsync($"location/{location.Id}/area", createAreaRequest);

        //Assert
        response.EnsureSuccessStatusCode();
        
        var areaId = response.Headers.Location!.ToString().Split('/').Last();
        var dbArea = DbContext.Locations.Include(l => l.Areas)
            .SingleOrDefault(x => x.Name == location.Name)?.Areas
            .SingleOrDefault(x => x.Name == createAreaRequest.Name);

        dbArea.Should().BeEquivalentTo(new Area
        {
            Id = int.Parse(areaId),
            Name = "Test Area 1",
            Description = "Test Area 1",
            LocationId = location.Id,
            Location = location
        }, "the data sent in the request should be added to the database");
    }

    [Test]
    public async Task CreatingNewAreaWithSameNameAsExistingAreaReturns400()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 2");
        var area = await SetUpArea(location, "Test Area 2");

        var createAreaRequest = new CreateAreaRequest
        {
            Name = "Test Area 2",
            Description = "Test Area 2"
        };

        //Act
        var response = await client.PostAsJsonAsync($"location/{location.Id}/area", createAreaRequest);

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, "areas cannot share the same name");

        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Be("\"Area already exists\"", "areas cannot share the same name");

        var dbArea = DbContext.Locations.Include(l => l.Areas)
            .SingleOrDefault(x => x.Name == location.Name)?.Areas
            .Where(x => x.Name == area.Name);
        dbArea.Should().HaveCount(1, "the duplicate area should not have been added to the database");
    }
    
    [Test]
    public async Task UpdatingExistingAreaIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 3");
        var area = await SetUpArea(location, "Test Area 7");

        var updateAreaRequest = new UpdateAreaRequest
        {
            Name = "Test Area 7 - updated",
            Description = "Test Area 7 - updated",
            FloorPlanJson = "[]"
        };
        
        //Act
        var response = await client.PutAsJsonAsync($"location/{location.Id}/area/{area.Id}", updateAreaRequest);

        //Assert
        response.EnsureSuccessStatusCode();
        
        var dbArea = await DbContext.Areas
            .AsNoTracking()
            .SingleOrDefaultAsync(a => a.Id == area.Id);

        dbArea.Should().BeEquivalentTo(new Area
        {
            Id = area.Id,
            Name = "Test Area 7 - updated",
            Description = "Test Area 7 - updated",
            FloorPlanJson = "[]",
            LocationId = location.Id
        }, "updates sent in the request should be reflected in the database");
    }

    [OneTimeSetUp]
    public async Task BookingEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "areatestuser",
            FirstName = "Area",
            LastName = "User",
            Email = "areatestuser@hippodigital.co.uk"
        });
    }
    
    [Test]
    public async Task GetAreasShouldReturnAllExistingAreasForLocationSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 3");
        var areas = new List<Area>
        {
            await SetUpArea(location, "Test Area 3"),
            await SetUpArea(location, "Test Area 4"),
            await SetUpArea(location, "Test Area 5")
        };
        
        //Act
        var response = await client.GetAsync($"location/{location.Id}/area");
        
        //Assert
        response.EnsureSuccessStatusCode();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseAreas = JsonSerializer.Deserialize<List<AreaQueryResponse>>(responseContent, new JsonSerializerOptions 
        {
            PropertyNameCaseInsensitive = true
        });
        responseAreas.Should()
            .BeEquivalentTo(areas.Select(a => new AreaQueryResponse {Id = a.Id, Name = a.Name}).ToList(),
                "the returned areas should match the areas created");
    }

    [Test]
    public async Task GetAreaShouldReturnAreaSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 4");
        var areas = new List<Area>
        {
            await SetUpArea(location, "Test Area 5"),
            await SetUpArea(location, "Test Area 6"),
        };
        
        //Act
        var response = await client.GetAsync($"location/{location.Id}/area/{areas.First().Id}");
        
        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseArea = JsonSerializer.Deserialize<AreaQueryResponse>(responseContent, new JsonSerializerOptions 
        {
            PropertyNameCaseInsensitive = true
        });

        responseArea.Should().BeEquivalentTo(new AreaQueryResponse
            {
                Id = areas.First().Id, 
                Name = areas.First().Name,
                FloorPlanJson = "[]",
            },
            "the correct area should be returned");
    }
}