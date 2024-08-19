using FluentValidation;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace Hippo.Booking.Application.Tests;

public static class TestHelpers
{
    public static IDataContext GetDbContext(string name)
    {
        var dbOptions = new DbContextOptionsBuilder<HippoBookingDbContext>()
            .UseInMemoryDatabase(name)
            .Options;

        return new HippoBookingDbContext(dbOptions);
    }

    public static async Task AssertValidatorCalled<T>(IValidator<T> validator, T instance)
    {
        await validator.Received().ValidateAsync(
            Arg.Is<ValidationContext<T>>(x => x.InstanceToValidate!.Equals(instance)),
            Arg.Any<CancellationToken>());
    }
}