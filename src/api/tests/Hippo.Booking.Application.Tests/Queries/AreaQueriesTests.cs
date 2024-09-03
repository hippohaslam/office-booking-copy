using FluentAssertions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Application.Queries.Locations;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Tests.Queries;

public class AreaQueriesTests
{
    private AreaQueries _sut;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        var dbContext = TestHelpers.GetDbContext(nameof(AreaQueriesTests));

        dbContext.AddEntity(new Location()
        {
            Name = "Existing Location 2",
            Description = "Existing Location Description 2",
            Areas =
            [
                new Area
                {
                    Name = "Existing Area 2",
                    Description = "Existing Area Description 2",
                    FloorPlanJson = "{}",
                    BookableObjects =
                    [
                        new BookableObject
                        {
                            Name = "Existing BookableObject 2",
                            Description = "Existing BookableObject Description 2",
                            BookableObjectTypeId = BookableObjectTypeEnum.Dog
                        }
                    ]
                }
            ]
        });

        await dbContext.Save();
        
        _sut = new AreaQueries(dbContext);
    }
    
    [Test]
    public async Task GetAreaByIdDoesNotExistReturnsNull()
    {
        var result = await _sut.GetAreaById(999, 999);

        result.Should().BeNull();
    }
    
    [Test]
    public async Task GetAreaByIdReturnsAreaAndBookableObjects()
    {
        var result = await _sut.GetAreaById(1, 1);
        
        result.Should().NotBeNull();
        
        result.Should().BeEquivalentTo(new AreaQueryResponse
        {
            Id = 1,
            Name = "Existing Area 2",
            AreaTypeId = 0,
            FloorPlanJson = "{}",
            BookableObjects =
            [
                new()
                {
                    Id = 1,
                    Name = "Existing BookableObject 2",
                    Description = "Existing BookableObject Description 2",
                    FloorPlanObjectId = "",
                    BookableObjectTypeId = BookableObjectTypeEnum.Dog
                }
            ],

        });
    }
}