using Hippo.Booking.Application.Models;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Queries.Locations;

public class AreaQueryResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public AreaTypeEnum AreaTypeId { get; set; }

    public string FloorPlanJson { get; set; } = string.Empty;

    public List<BookableObjectDto> BookableObjects { get; set; } = new();
}