using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;
using Hippo.Booking.Application.Commands.Areas;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class AreaCommandsTests : CommandTest
{
    private AreaCommands _sut;
    private IDataContext _dataContext;

    private IValidator<CreateAreaRequest> _createAreaRequestValidator;
    private IValidator<UpdateAreaRequest> _updateAreaRequestValidator;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = GetDbContext(nameof(AreaCommandsTests));

        _dataContext.AddEntity(new Area
        {
            Name = "Existing Area",
            Description = "Existing Area Description",
            Location = new Location
            {
                Name = "Existing Location",
                Description = "Existing Location Description"
            }
        });

        await _dataContext.Save();

        _createAreaRequestValidator = Substitute.For<IValidator<CreateAreaRequest>>();
        _updateAreaRequestValidator = Substitute.For<IValidator<UpdateAreaRequest>>();

        _sut = new AreaCommands(
            _dataContext,
            _createAreaRequestValidator,
            _updateAreaRequestValidator);
    }

    [Test]
    public async Task CanCreateArea()
    {
        var request = new CreateAreaRequest
        {
            Name = "Test Area",
            Description = "Test Area Description",
            AreaTypeId = AreaTypeEnum.CarPark
        };

        var result = await _sut.Handle(1, request);

        result.Should().NotBe(0);

        var existingArea = await _dataContext.Query<Area>()
            .FirstOrDefaultAsync(x => x.Id == result);

        using (new AssertionScope())
        {
            existingArea.Should().NotBeNull("Area should be created");
            existingArea!.Name.Should().Be(request.Name, "Name should match request");
            existingArea.Description.Should().Be(request.Description, "Description should match request");
        }

        await AssertValidatorCalled(_createAreaRequestValidator, request);
    }

    [Test]
    public void CannotCreateDuplicateArea()
    {
        var request = new CreateAreaRequest
        {
            Name = "Existing Area"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(1, request));
    }

    [Test]
    public void CannotCreateAreaWithInvalidLocation()
    {
        var request = new CreateAreaRequest
        {
            Name = "Test Area",
            Description = "Test Area Description"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(5, request));
    }

    [Test]
    public async Task CanUpdateArea()
    {
        var existingArea = await _dataContext.Query<Area>()
            .FirstOrDefaultAsync(x => x.Name == "Existing Area");

        var request = new UpdateAreaRequest
        {
            Name = "Updated Area",
            Description = "Updated Area Description",
            FloorPlanJson = "{}",
            AreaTypeId = AreaTypeEnum.CarPark
        };

        await _sut.Handle(existingArea!.Id, existingArea.LocationId, request);

        var updatedArea = await _dataContext.Query<Area>()
            .FirstOrDefaultAsync(x => x.Id == existingArea!.Id);

        using (new AssertionScope())
        {
            updatedArea.Should().NotBeNull("Area should be updated and still exist");
            updatedArea!.Name.Should().Be(request.Name, "Name should match request");
            updatedArea.Description.Should().Be(request.Description, "Description should match request");
        }

        await AssertValidatorCalled(_updateAreaRequestValidator, request);
    }

    [Test]
    public async Task CannotUpdateAreaThatDoesntExist()
    {
        var existingArea = await _dataContext.Query<Area>()
            .FirstOrDefaultAsync(x => x.Name == "Existing Area");

        var request = new UpdateAreaRequest
        {
            Name = "Updated Area",
            Description = "Updated Area Description",
            AreaTypeId = AreaTypeEnum.CarPark
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(5, existingArea!.LocationId, request));
    }

    [Test]
    public async Task CannotUpdateAreaWithInvalidLocation()
    {
        var existingArea = await _dataContext.Query<Area>()
            .FirstOrDefaultAsync(x => x.Name == "Existing Area");

        var request = new UpdateAreaRequest
        {
            Name = "Updated Area",
            Description = "Updated Area Description",
            AreaTypeId = AreaTypeEnum.CarPark
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(existingArea!.Id, 5, request));
    }
}