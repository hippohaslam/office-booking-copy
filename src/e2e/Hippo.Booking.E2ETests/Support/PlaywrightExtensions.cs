using System.Text.RegularExpressions;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Support;

public static class PlaywrightExtensions
{
    public static Task ToHaveURLRegexMatchAsync(this IPageAssertions pageAssertions, string regex)
    {
        var baseUrl = Config.BaseUrl.Replace("/", "\\/");
        return pageAssertions.ToHaveURLAsync(new Regex(baseUrl + regex));
    }
}