using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class LocationCommandsTest
{
    private LocationCommands _sut;
    private IDataContext _dataContext;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = TestHelpers.GetDbContext(nameof(LocationCommandsTest));

        _dataContext.AddEntity(new Location
        {
            Name = "Existing Location",
            Description = "Existing Location Description"
        });

        await _dataContext.Save();

        _sut = new LocationCommands(
            _dataContext,
            Substitute.For<IValidator<CreateLocationRequest>>(),
            Substitute.For<IValidator<UpdateLocationRequest>>());
    }

    [Test]
    public async Task CanCreateLocation()
    {
        var request = new CreateLocationRequest
        {
            Name = "Test Location",
            Description = "Test Location Description",
            Address = "Test Address",
            SlackChannel = "Test Slack Channel",
            GuideLink = "Test Guide Link"
        };

        var result = await _sut.Handle(request);

        result.Should().NotBe(0);

        var existingLocation = await _dataContext.Query<Location>()
            .FirstOrDefaultAsync(x => x.Id == result);

        using (new AssertionScope())
        {
            existingLocation.Should().NotBeNull();
            existingLocation!.Name.Should().Be(request.Name);
            existingLocation.Description.Should().Be(request.Description);
            existingLocation.Address.Should().Be(request.Address);
            existingLocation.SlackChannel.Should().Be(request.SlackChannel);
            existingLocation.GuideLink.Should().Be(request.GuideLink);
        }
    }

    [Test]
    public void CannotCreateDuplicateLocation()
    {
        var request = new CreateLocationRequest
        {
            Name = "Existing Location"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(request));
    }

    [Test]
    public async Task CanUpdateLocation()
    {
        var existingLocation = _dataContext.Query<Location>()
            .FirstOrDefault(x => x.Name == "Existing Location");

        var request = new UpdateLocationRequest
        {
            Name = "Updated Location",
            Description = "Updated Location Description",
            Address = "Updated Address",
            SlackChannel = "Updated Slack Channel",
            GuideLink = "Updated Guide Link"
        };

        Assert.DoesNotThrowAsync(async () => await _sut.Handle(existingLocation!.Id, request));

        var updatedLocation = await _dataContext.Query<Location>()
            .FirstOrDefaultAsync(x => x.Id == existingLocation!.Id);

        using (new AssertionScope())
        {
            updatedLocation.Should().NotBeNull("Location should be updated");
            updatedLocation!.Name.Should().Be(request.Name, "Name should match request");
            updatedLocation.Description.Should().Be(request.Description, "Description should match request");
            updatedLocation.Address.Should().Be(request.Address);
            updatedLocation.SlackChannel.Should().Be(request.SlackChannel);
            updatedLocation.GuideLink.Should().Be(request.GuideLink);
        }
    }

    [Test]
    public void CannotUpdateNonExistingLocation()
    {
        var request = new UpdateLocationRequest
        {
            Name = "Updated Location"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(0, request));
    }
}