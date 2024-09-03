using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Models;

public class BookableObjectDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string FloorPlanObjectId { get; set; } = string.Empty;
    public BookableObjectTypeEnum BookableObjectTypeId { get; set; }
}