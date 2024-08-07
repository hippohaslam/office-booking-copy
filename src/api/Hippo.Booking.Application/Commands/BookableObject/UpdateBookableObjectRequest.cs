namespace Hippo.Booking.Application.Commands.BookableObject;

public class UpdateBookableObjectRequest
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanObjectId { get; set; } = string.Empty;
}