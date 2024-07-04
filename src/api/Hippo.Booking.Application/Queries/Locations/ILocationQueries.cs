using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Queries.Locations;

public interface ILocationQueries
{
    Task<List<IdName<int>>> GetLocations();

    Task<LocationQueryResponse?> GetLocationById(int id);
}