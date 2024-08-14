using Hippo.Booking.Application.Queries.Users;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Core.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.API.Endpoints;

public class UserManagementEndpoints() : EndpointBase("users", "User Management", AccessLevelEnum.Admin)
{
    public override void MapEndpoints(RouteGroupBuilder builder)
    {
        builder.MapGet("", async Task<Results<Ok<PagedList<UserListResponse>>, ForbidHttpResult, UnauthorizedHttpResult>>
             (IUserQueries userQueries,
                [FromQuery] int page = 1,
                [FromQuery] int pageSize = 15) =>
        {
            var users = await userQueries.GetUsers(page, pageSize);

            return TypedResults.Ok(users);
        });
    }
}