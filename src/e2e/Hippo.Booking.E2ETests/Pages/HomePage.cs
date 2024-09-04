using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class HomePage(IPage page)
{
    private ILocator H1Heading => page.Locator("h1");

    private ILocator MakeANewBookingCta => page.GetByRole(AriaRole.Main)
        .GetByRole(AriaRole.Link, new() {Name = "Make a new booking"}).Filter();
    
    public async Task AssertPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl);
        await Assertions.Expect(H1Heading).ToHaveTextAsync("Hi Booking");
    }

    public async Task ClickMakeANewBookingCta() => await MakeANewBookingCta.ClickAsync();
}