using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;
using Hippo.Booking.Application.Commands.BookableObject;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class BookableObjectCommandTests
{
    private BookableObjectCommands _sut;
    private IDataContext _dataContext;
    private IValidator<CreateBookableObjectRequest> _createBookableObjectRequestValidator;
    private IValidator<UpdateBookableObjectRequest> _updateBookableObjectRequestValidator;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = TestHelpers.GetDbContext(nameof(BookableObjectCommands));

        _dataContext.AddEntity(new BookableObject
        {
            Name = "Existing BookableObject",
            Description = "Existing BookableObject Description",
            Area = new Area
            {
                Name = "Existing Area",
                Description = "Existing Area Description",
                Location = new Location
                {
                    Name = "Existing Location",
                    Description = "Existing Location Description"
                }
            }
        });

        await _dataContext.Save();

        _createBookableObjectRequestValidator = Substitute.For<IValidator<CreateBookableObjectRequest>>();
        _updateBookableObjectRequestValidator = Substitute.For<IValidator<UpdateBookableObjectRequest>>();
        
        _sut = new BookableObjectCommands(
            _dataContext, 
            _createBookableObjectRequestValidator,
            _updateBookableObjectRequestValidator);
    }

    [Test]
    public async Task CanCreateBookableObject()
    {
        var request = new CreateBookableObjectRequest
        {
            Name = "Test BookableObject",
            Description = "Test BookableObject Description",
            FloorPlanObjectId = "23232"
        };

        var result = await _sut.Handle(1, 1, request);

        result.Should().NotBe(0);

        var existingBookableObject = await _dataContext.Query<BookableObject>()
            .FirstOrDefaultAsync(x => x.Id == result);

        using (new AssertionScope())
        {
            existingBookableObject.Should().NotBeNull("BookableObject should be created and exist");
            existingBookableObject!.Name.Should().Be(request.Name, "Name should match request");
            existingBookableObject.Description.Should().Be(request.Description, "Description should match request");
        }

        await TestHelpers.AssertValidatorCalled(_createBookableObjectRequestValidator, request);
    }

    [Test]
    public async Task CannotCreateDuplicateBookableObject()
    {
        var request = new CreateBookableObjectRequest
        {
            Name = "Existing BookableObject",
        };

        var area = await _dataContext.Query<Area>()
            .SingleAsync(x => x.Name == "Existing Area");

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(area.LocationId, area.Id, request));
    }

    [Test]
    public void CannotCreateBookableObjectWithInvalidArea()
    {
        var request = new CreateBookableObjectRequest
        {
            Name = "Test BookableObject",
            Description = "Test BookableObject Description"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(1, 5, request));
    }

    [Test]
    public void CannotCreateBookableObjectWithInvalidLocation()
    {
        var request = new CreateBookableObjectRequest
        {
            Name = "Test BookableObject",
            Description = "Test BookableObject Description"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(5, 1, request));
    }

    [Test]
    public async Task CanUpdateBookableObject()
    {
        var existingBookableObject = await _dataContext.Query<BookableObject>()
            .SingleAsync(x => x.Name == "Existing BookableObject");

        var request = new UpdateBookableObjectRequest
        {
            Name = "Updated BookableObject",
            Description = "Updated BookableObject Description",
            FloorPlanObjectId = "23232"
        };

        await _sut.Handle(
            existingBookableObject.Id,
            1,
            existingBookableObject.AreaId,
            request);

        var updatedBookableObject = await _dataContext.Query<BookableObject>()
            .FirstOrDefaultAsync(x => x.Id == existingBookableObject!.Id);

        using (new AssertionScope())
        {
            updatedBookableObject.Should().NotBeNull("BookableObject should be updated and still exist");
            updatedBookableObject!.Name.Should().Be(request.Name, "Name should match request");
            updatedBookableObject.Description.Should().Be(request.Description, "Description should match request");
        }
        
        await TestHelpers.AssertValidatorCalled(_updateBookableObjectRequestValidator, request);
    }

    [Test]
    public void CannotUpdateBookableObjectThatDoesntExist()
    {
        var request = new UpdateBookableObjectRequest
        {
            Name = "Updated BookableObject",
            Description = "Updated BookableObject Description"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(5, 1, 1, request));
    }
}