using FluentAssertions;
using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class AreaEndpointTests : IntegrationTestBase
{
    [OneTimeSetUp]
    public async Task BookingEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "getareatestuser",
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
        var location = await SetUpLocation("Area Test Location 5");
        var areas = new List<Area>
        {
            await SetUpArea(location, "Test Area 7"),
            await SetUpArea(location, "Test Area 8"),
            await SetUpArea(location, "Test Area 9")
        };

        //Act
        var response = await client.GetAsync($"location/{location.Id}/area");

        //Assert
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseAreas = responseContent.FromJson<List<AreaQueryResponse>>();

        responseAreas.Should()
            .BeEquivalentTo(areas.Select(a => new AreaQueryResponse
            {
                Id = a.Id,
                Name = a.Name,
                AreaTypeId = a.AreaTypeId
            }).ToList(),
                "the returned areas should match the areas created");
    }

    [Test]
    public async Task GetAreaShouldReturnAreaSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Area Test Location 6");
        var areas = new List<Area>
        {
            await SetUpArea(location, "Test Area 10"),
            await SetUpArea(location, "Test Area 11"),
        };

        //Act
        var response = await client.GetAsync($"location/{location.Id}/area/{areas.First().Id}");

        //Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var responseArea = responseContent.FromJson<AreaQueryResponse>();

        responseArea.Should().BeEquivalentTo(new AreaQueryResponse
        {
            Id = areas.First().Id,
            Name = areas.First().Name,
            FloorPlanJson = "[]",
            AreaTypeId = AreaTypeEnum.Desks
        },
            "the correct area should be returned");
    }
}