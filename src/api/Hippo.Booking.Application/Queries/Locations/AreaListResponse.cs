using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Application.Queries.Locations;

public class AreaListResponse
{
    public int Id { get; set; }

    public string Name { get; set; }

    public AreaTypeEnum AreaTypeId { get; set; }
}