using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class BookableObjectEndpointTests : IntegrationTestBase
{
    [Test]
    public async Task CreatingAUniqueBookableObjectForAnExistingAreaAndLocationIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Bookable Object Test Location 1");
        var area = await SetUpArea(location, "Bookable Object Test Area 1");

        var createBookableObjectRequest = new CreateBookableObjectRequest
        {
            Name = "Bookable Object Test Object 1",
            Description = "Bookable Object Test Object 1",
            FloorPlanObjectId = "1"
        };

        //Act
        var response = await client.PostAsJsonAsync($"admin/location/{location.Id}/area/{area.Id}/bookable-object",
            createBookableObjectRequest);

        //Assert
        response.EnsureSuccessStatusCode();

        var bookableObjectId = response.Headers.Location!.ToString().Split('/').Last();

        var dbObject = DbContext.BookableObjects.SingleOrDefault(b => b.Name == createBookableObjectRequest.Name);
        dbObject.Should().BeEquivalentTo(new BookableObject
        {
            Id = int.Parse(bookableObjectId),
            Name = "Bookable Object Test Object 1",
            Description = "Bookable Object Test Object 1",
            FloorplanObjectId = "1",
            AreaId = area.Id,
            Area = area,
            BookableObjectTypeId = BookableObjectTypeEnum.Standard
        }, "the data sent in the request should be added to the dataset");
    }

    [Test]
    public async Task CreatingNewBookableObjectWithSameNameAsExistingBookableObjectReturns400()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Bookable Object Test Location 1");
        var area = await SetUpArea(location, "Bookable Object Test Area 1");
        var bookableObject = await SetUpBookableObject(area, "Bookable Object Test Object 3");

        var createBookableObjectRequest = new CreateBookableObjectRequest
        {
            Name = "Bookable Object Test Object 3",
            Description = "Bookable Object Test Object 3",
            FloorPlanObjectId = "1"
        };

        //Act
        var response = await client.PostAsJsonAsync($"admin/location/{location.Id}/area/{area.Id}/bookable-object",
            createBookableObjectRequest);

        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest, "bookable objects cannot share the same name");

        var responseContent = await response.Content.ReadAsStringAsync();
        responseContent.Should().Be("\"Bookable object with this name already exists in this area.\"",
            "bookable objects cannot share the same name");

        var dbBookableObject =
            DbContext.BookableObjects.AsNoTracking().Where(b => b.Name == bookableObject.Name);
        dbBookableObject.Should()
            .HaveCount(1, "the duplicate bookable object should not have been added to the database");
    }

    [Test]
    public async Task UpdatingExistingBookableObjectIsSuccessful()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation("Bookable Object Test Location 1");
        var area = await SetUpArea(location, "Bookable Object Test Area 1");
        var bookableObject = await SetUpBookableObject(area, "Bookable Object Test Object 2");

        var updateBookableObjectRequest = new UpdateBookableObjectRequest
        {
            Name = "Bookable Object Test Object 2 - updated",
            Description = "Bookable Object Test Object 2 - updated",
            FloorPlanObjectId = "2"
        };

        //Act
        var response = await client.PutAsJsonAsync($"admin/location/{location.Id}/area/{area.Id}/bookable-object/{bookableObject.Id}",
            updateBookableObjectRequest);

        //Assert
        response.EnsureSuccessStatusCode();

        var dbBookableObject = DbContext.BookableObjects.AsNoTracking().SingleOrDefault(b => b.Id == bookableObject.Id);
        dbBookableObject.Should().BeEquivalentTo(new BookableObject
        {
            Id = bookableObject.Id,
            Name = "Bookable Object Test Object 2 - updated",
            Description = "Bookable Object Test Object 2 - updated",
            FloorplanObjectId = "2",
            AreaId = area.Id,
            BookableObjectTypeId = BookableObjectTypeEnum.Standard
        }, "updates sent in the request should be reflected in the database");
    }
}