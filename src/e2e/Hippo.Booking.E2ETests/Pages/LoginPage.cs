using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class LoginPage(IPage page)
{
    private ILocator H1Heading => page.Locator("h1");

    public async Task GoToPage()
    {
        await page.GotoAsync(Config.BaseUrl);
    }

    public async Task AssertPage()
    {
        await Assertions.Expect(page).ToHaveURLAsync($"{Config.BaseUrl}signin?returnUrl=/");
        await Assertions.Expect(H1Heading).ToHaveTextAsync("Office bookings");
    }
}