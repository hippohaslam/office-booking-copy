using Hippo.Booking.Application.Commands.Bookings;
using Hippo.Booking.Core;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class CreateBookingRequestValidatorTests() :
    ValidatorTest<CreateBookingRequest, CreateBookingRequestValidator>(new CreateBookingRequestValidator(new SystemDateTimeProvider()))
{
    public override List<CreateBookingRequest> PositiveTestCases { get; } = new()
    {
        new CreateBookingRequest
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now),
            AreaId = 1,
            BookableObjectId = 1
        }
    };

    public override List<CreateBookingRequest> NegativeTestCases { get; } = new()
    {
        new CreateBookingRequest
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now.AddDays(-1)),
            AreaId = 1,
            BookableObjectId = 1
        },
        new CreateBookingRequest
        {
            UserId = "1",
            Date = DateOnly.MinValue,
            AreaId = 1,
            BookableObjectId = 1
        },
        new CreateBookingRequest
        {
            UserId = "",
            Date = DateOnly.FromDateTime(DateTime.Now),
            AreaId = 1,
            BookableObjectId = 1
        },
        new CreateBookingRequest
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now),
            AreaId = 0,
            BookableObjectId = 1
        },
        new CreateBookingRequest
        {
            UserId = "1",
            Date = DateOnly.FromDateTime(DateTime.Now),
            AreaId = 1,
            BookableObjectId = 0
        },
    };
}