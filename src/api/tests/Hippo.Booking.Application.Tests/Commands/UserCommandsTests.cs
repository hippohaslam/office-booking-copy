using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;
using Hippo.Booking.Application.Commands.Users;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class UserCommandsTests
{
    private UserCommands _sut;
    private IDataContext _dataContext;
    private IValidator<RegisteredUserRequest> _registeredUserRequestValidator;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = TestHelpers.GetDbContext(nameof(UserCommandsTests));
        _registeredUserRequestValidator = Substitute.For<IValidator<RegisteredUserRequest>>();

        _dataContext.AddEntity(new User
        {
            Id = "1",
            FirstName = "Existing",
            LastName = "User",
            Email = "existing@test.com"
        });

        await _dataContext.Save();

        _sut = new UserCommands(_dataContext, _registeredUserRequestValidator);
    }

    [Test]
    public async Task UpsertingUserWillCreateUserIfDoesNotExist()
    {
        var registerRequest = new RegisteredUserRequest
        {
            UserId = "2",
            Email = "test@test.com",
            FirstName = "Test",
            LastName = "User"
        };

        var result = await _sut.UpsertUser(registerRequest);

        result.Should().BeEquivalentTo(registerRequest);

        var existingUserCount = await _dataContext.Query<User>().Where(x => x.Id == "1" || x.Id == "2")
            .ToListAsync();

        existingUserCount.Count.Should().Be(2);

        var newUser = existingUserCount.Single(x => x.Id == "2");

        using (new AssertionScope())
        {
            newUser!.Email.Should().Be(registerRequest.Email, "Email should be set");
            newUser.FirstName.Should().Be(registerRequest.FirstName, "First name should be set");
            newUser.LastName.Should().Be(registerRequest.LastName, "Last name should be set");
        }
    }

    [Test]
    public async Task UpsertingUserWillUpdateUserIfUserExists()
    {
        var registerRequest = new RegisteredUserRequest
        {
            UserId = "1",
            Email = "test@test.com2",
            FirstName = "Test2",
            LastName = "User2"
        };

        var existingUserCount = await _dataContext.Query<User>().CountAsync();

        await _sut.UpsertUser(registerRequest);

        var actualUserCount = await _dataContext.Query<User>().CountAsync();

        actualUserCount.Should().Be(existingUserCount, "User count should not change");

        var user = await _dataContext.Query<User>().SingleAsync(x => x.Id == "1");

        using (new AssertionScope())
        {
            user!.Email.Should().Be(registerRequest.Email);
            user.FirstName.Should().Be(registerRequest.FirstName);
            user.LastName.Should().Be(registerRequest.LastName);
        }
    }
}