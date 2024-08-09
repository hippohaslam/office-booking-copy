using System.Text.RegularExpressions;

namespace Hippo.Booking.Core.Extensions;

public static class StringExtensions
{
    public static string ToFriendlyCase(this string pascalString)
    {
        return Regex.Replace(pascalString, "(?!^)([A-Z])", " $1");
    }
}