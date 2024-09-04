using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.SharedComponents;

public class HeaderComponent(IPage page)
{
    private ILocator Header => page.Locator("header");
    private ILocator SiteLogo => page.GetByAltText("Hippo Logo");
    private ILocator SiteHeading => page.GetByRole(AriaRole.Link, new() {Name = "Office Bookings"});
    private ILocator NavMenu => Header.GetByRole(AriaRole.Navigation);

    public async Task AssertHeader()
    {
        await Assertions.Expect(SiteLogo).ToBeVisibleAsync();
        await Assertions.Expect(SiteHeading).ToBeVisibleAsync();
        await Assertions.Expect(NavMenu).ToBeVisibleAsync();
    }

    public async Task ClickSignOutButton()
    {
        await NavMenu.GetByRole(AriaRole.Button, new () {Name = "Sign out"}).ClickAsync();
    }
}