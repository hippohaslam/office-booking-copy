using FluentAssertions;
using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class LocationEndpointTests : IntegrationTestBase
{
    [OneTimeSetUp]
    public async Task LocationEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "getlocationtestuser",
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
        await SetUpLocation("Location Test location 7");
        await SetUpLocation("Location Test Location 8");
        await SetUpLocation("Location Test Location 9");

        //Act
        var response = await client.GetAsync("location");

        //Assert
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseLocations = responseContent.FromJson<List<LocationQueryResponse>>() ?? [];
        var dbLocations = DbContext.Locations.ToList();
        var expectedLocations = dbLocations
            .Select(l => l.Id).ToList();

        responseLocations.Select(x => x.Id)
            .Should()
            .BeEquivalentTo(expectedLocations, "the returned locations should match the existing locations");
    }

    [Test]
    public async Task GetLocationShouldReturnLocationSuccessfully()
    {
        //Arrange
        var client = GetClient();
        var locations = new List<Location>
        {
            await SetUpLocation("Location Test location 10"),
            await SetUpLocation("Location Test Location 11"),
            await SetUpLocation("Location Test Location 12")
        };

        //Act
        var response = await client.GetAsync("location/" + locations.First().Id);

        //Assert
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        var responseLocation = responseContent.FromJson<LocationQueryResponse>();

        responseLocation.Should().BeEquivalentTo(new LocationQueryResponse
        {
            Id = locations.First().Id,
            Name = locations.First().Name
        },
            "the correct location should be returned");
    }
}