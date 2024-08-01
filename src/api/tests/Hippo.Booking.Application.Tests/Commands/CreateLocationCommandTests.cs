using FluentAssertions;
using FluentValidation;
using Hippo.Booking.Application.Commands.Location;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class CreateLocationCommandTests
{
    private ICreateLocationCommmand _sut;

    [OneTimeSetUp]
    public async Task Setup()
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseInMemoryDatabase("fakeDb")
            .Options;

        IDataContext dataContext = new HippoBookingDbContext(dbOptions);

        dataContext.AddEntity(new Location
        {
            Name = "Existing Location"
        });

        await dataContext.Save();
        
        _sut = new LocationCommands(
            dataContext,
            Substitute.For<IValidator<CreateLocationRequest>>(),
            Substitute.For<IValidator<UpdateLocationRequest>>());
    }
    
    [Test]
    public async Task CanCreateLocation()
    {
        var request = new CreateLocationRequest
        {
            Name = "Test Location"
        };
        
        var result = await _sut.Handle(request);
        
        result.Should().NotBe(0);
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
}