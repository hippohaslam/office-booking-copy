using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.API.Extensions;

public static class EndpointRouteBuilderExtensions
{
    public static T WithAccessLevel<T>(this T builder, AccessLevelEnum accessLevel)
        where T : IEndpointConventionBuilder
    {
        switch (accessLevel)
        {
            case AccessLevelEnum.Anonymous:
                break;
            case AccessLevelEnum.User:
                builder.RequireAuthorization();
                break;
            case AccessLevelEnum.Admin:
                builder.RequireAuthorization(x => x.RequireRole("Admin"));
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(accessLevel), accessLevel, null);
        }

        return builder;
    }
}