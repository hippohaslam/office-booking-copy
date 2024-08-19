using Hippo.Booking.Application.Commands.Bookings;

namespace Hippo.Booking.Application.Tests.Validators;

[TestFixture]
public class DeleteBookingRequestValidatorTests() :
    ValidatorTest<DeleteBookingRequest, DeleteBookingRequestValidator>(new DeleteBookingRequestValidator())
{
    public override List<DeleteBookingRequest> PositiveTestCases { get; } = new()
    {
        new DeleteBookingRequest
        {
            BookingId = 1
        }
    };

    public override List<DeleteBookingRequest> NegativeTestCases { get; } = new()
    {
        new DeleteBookingRequest
        {
            BookingId = 0
        }
    };
}