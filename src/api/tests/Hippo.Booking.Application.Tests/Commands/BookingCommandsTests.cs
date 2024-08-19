using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;
using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Application.Models;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class BookingCommandsTests
{
    private BookingCommands _sut;
    private IDataContext _dataContext;
    private IUserNotifier _userNotifier;
    private IUserProvider _userProvider;
    private IBookingQueries _bookingQueries;
    private IValidator<CreateBookingRequest> _createBookingValidator;
    private IValidator<DeleteBookingRequest> _deleteBookingValidator;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = TestHelpers.GetDbContext(nameof(BookingCommandsTests));

        _dataContext.AddEntity(new Core.Entities.Booking
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now),
            BookableObject = new BookableObject
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
            }
        });

        await _dataContext.Save();

        _userNotifier = Substitute.For<IUserNotifier>();
        _userProvider = Substitute.For<IUserProvider>();
        _userProvider.GetCurrentUser().Returns(new RegisteredUserModel
        {
            UserId = "1",
            FirstName = "Test",
            LastName = "User",
            Email = "test@user.com"
        });

        _createBookingValidator = Substitute.For<IValidator<CreateBookingRequest>>();
        _deleteBookingValidator = Substitute.For<IValidator<DeleteBookingRequest>>();
        _bookingQueries = new BookingQueries(_dataContext, new SystemDateTimeProvider());
        
        _sut = new BookingCommands(
            _dataContext,
            _userNotifier,
            _userProvider,
            _bookingQueries,
            _createBookingValidator,
            _deleteBookingValidator);
    }

    [Test]
    public async Task CanCreateBooking()
    {
        var request = new CreateBookingRequest
        {
            AreaId = 1,
            BookableObjectId = 1,
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            UserId = "1"
        };

        var result = await _sut.Handle(request);

        result.Should().BeEquivalentTo(new BookingResponse
        {
            Id = result.Id,
            Date = request.Date,
            BookableObject = new IdName<int>(1, "Existing BookableObject"),
            Area = new IdName<int>(1, "Existing Area"),
            Location = new IdName<int>(1, "Existing Location"),
            UserId = "1"
        });

        var existingBooking = await _dataContext.Query<Core.Entities.Booking>()
            .FirstOrDefaultAsync(x => x.Id == result.Id);

        using (new AssertionScope())
        {
            existingBooking.Should().NotBeNull();
            existingBooking!.BookableObjectId.Should().Be(request.BookableObjectId);
            existingBooking.Date.Should().Be(request.Date);
            existingBooking.UserId.Should().Be(request.UserId);
        }

        await TestHelpers.AssertValidatorCalled(_createBookingValidator, request);
    }

    [Test]
    public async Task CannotCreateDuplicateBooking()
    {
        var existingBookableObject = await _dataContext.Query<BookableObject>()
            .SingleAsync(x => x.Name == "Existing BookableObject");

        var request = new CreateBookingRequest
        {
            AreaId = existingBookableObject.AreaId,
            BookableObjectId = existingBookableObject.Id,
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
            UserId = "1"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(request));
    }

    [Test]
    public void CannotCreateBookingWithInvalidBookableObject()
    {
        var request = new CreateBookingRequest
        {
            AreaId = 1,
            BookableObjectId = 10,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "1"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(request));
    }

    [Test]
    public void CannotCreateBookingWithInvalidArea()
    {
        var request = new CreateBookingRequest
        {
            AreaId = 10,
            BookableObjectId = 1,
            Date = DateOnly.FromDateTime(DateTime.Now),
            UserId = "1"
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(request));
    }

    [Test]
    public async Task CanConfirmBooking()
    {
        var existingBooking = await _dataContext.Query<Core.Entities.Booking>()
            .SingleAsync(x => x.Date == DateOnly.FromDateTime(DateTime.Now));

        await _sut.Handle(existingBooking.Id);

        var confirmedBooking = await _dataContext.Query<Core.Entities.Booking>()
            .FirstOrDefaultAsync(x => x.Id == existingBooking.Id);

        confirmedBooking.Should().NotBeNull("The booking should have been confirmed");
        confirmedBooking!.IsConfirmed.Should().BeTrue("The booking should be confirmed");
    }

    [Test]
    public void CannotConfirmBookingThatDoesNotExist()
    {
        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(5));
    }

    [Test]
    public async Task CanDeleteBooking()
    {
        var bookingToDelete = new Core.Entities.Booking
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
            BookableObject = await _dataContext.Query<BookableObject>().SingleAsync()
        };

        _dataContext.AddEntity(bookingToDelete);
        await _dataContext.Save();

        var request = new DeleteBookingRequest
        {
            BookingId = bookingToDelete.Id
        };

        await _sut.Handle(request);

        var deletedBooking = await _dataContext.Query<Core.Entities.Booking>()
            .FirstOrDefaultAsync(x => x.Id == bookingToDelete.Id);

        deletedBooking.Should().BeNull("The booking should have been deleted");

        await TestHelpers.AssertValidatorCalled(_deleteBookingValidator, request);
    }

    [Test]
    public async Task DeletingABookingThatDoesNotExistIsANoop()
    {
        var request = new DeleteBookingRequest
        {
            BookingId = 10
        };

        var existingCount = await _dataContext.Query<Core.Entities.Booking>()
            .CountAsync();

        await _sut.Handle(request);

        var actualCount = await _dataContext.Query<Core.Entities.Booking>()
            .CountAsync();

        actualCount.Should().Be(existingCount, "No bookings should have been deleted");
    }

    [Test]
    public async Task DeletingWithoutAValidUserIsForbidden()
    {
        var existingBooking = await _dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.BookableObject)
            .SingleAsync(x => x.Date == DateOnly.FromDateTime(DateTime.Now));

        var userProvider = Substitute.For<IUserProvider>();
        userProvider.GetCurrentUser().Returns((RegisteredUserModel?)null);

        var sut = new BookingCommands(
            _dataContext,
            _userNotifier,
            userProvider,
            _bookingQueries,
            _createBookingValidator,
            _deleteBookingValidator);

        var request = new DeleteBookingRequest
        {
            BookingId = existingBooking.Id
        };

        Assert.ThrowsAsync<ClientForbiddenException>(async () => await sut.Handle(request));
    }

    [Test]
    public async Task DeletingABookingThatIsNotUsersAsAStandardUserIsForbidden()
    {
        var existingBooking = await _dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.BookableObject)
            .SingleAsync(x => x.Date == DateOnly.FromDateTime(DateTime.Now));

        var userProvider = Substitute.For<IUserProvider>();
        userProvider.GetCurrentUser().Returns(new RegisteredUserModel
        {
            UserId = "2"
        });

        var sut = new BookingCommands(
            _dataContext,
            _userNotifier,
            userProvider,
            _bookingQueries,
            _createBookingValidator,
            _deleteBookingValidator);

        var request = new DeleteBookingRequest
        {
            BookingId = existingBooking.Id
        };

        Assert.ThrowsAsync<ClientForbiddenException>(async () => await sut.Handle(request));
    }

    [Test]
    public async Task DeletingABookingForSomebodyElseAsAnAdminIsSuccessful()
    {
        var bookingToDelete = new Core.Entities.Booking
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
            BookableObject = await _dataContext.Query<BookableObject>().SingleAsync()
        };

        _dataContext.AddEntity(bookingToDelete);
        await _dataContext.Save();

        var userProvider = Substitute.For<IUserProvider>();
        userProvider.GetCurrentUser().Returns(new RegisteredUserModel
        {
            UserId = "2",
            IsAdmin = true
        });

        var sut = new BookingCommands(
            _dataContext,
            _userNotifier,
            userProvider,
            _bookingQueries,
            _createBookingValidator,
            _deleteBookingValidator);

        var request = new DeleteBookingRequest
        {
            BookingId = bookingToDelete.Id
        };

        await sut.Handle(request);

        var deletedBooking = await _dataContext.Query<Core.Entities.Booking>()
            .FirstOrDefaultAsync(x => x.Id == bookingToDelete.Id);

        deletedBooking.Should().BeNull("The booking should have been deleted");
    }
}