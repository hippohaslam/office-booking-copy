using FluentAssertions;
using FluentValidation;
using Hippo.Booking.Application.Commands;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class CreateOfficeCommandTests
{
    private ICreateOfficeCommmand _sut;

    [OneTimeSetUp]
    public async Task Setup()
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseInMemoryDatabase("fakeDb")
            .Options;

        IDataContext dataContext = new HippoBookingDbContext(dbOptions);

        dataContext.Set<Office>().Add(new Office
        {
            Name = "Existing Office"
        });

        await dataContext.Save();
        
        _sut = new OfficeCommands(
            dataContext,
            Substitute.For<IValidator<CreateOfficeRequest>>(),
            Substitute.For<IValidator<UpdateOfficeRequest>>());
    }
    
    [Test]
    public async Task CanCreateOffice()
    {
        var request = new CreateOfficeRequest
        {
            Name = "Test Office"
        };
        
        var result = await _sut.Handle(request);
        
        result.Should().NotBe(0);
    }
    
    [Test]
    public void CannotCreateDuplicateOffice()
    {
        var request = new CreateOfficeRequest
        {
            Name = "Existing Office"
        };
        
        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(request));
    }
}