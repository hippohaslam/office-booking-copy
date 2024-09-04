using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.SharedComponents;

public class BannerComponent(IPage page)
{
    private ILocator Banner => page.GetByRole(AriaRole.Alert);
    private ILocator BannerTitle => Banner.Locator("strong");
    private ILocator BannerDescription => Banner.Locator("p");
    private ILocator BannerCloseButton => Banner.GetByRole(AriaRole.Button, new() {Name = "close banner"});

    public async Task AssertBanner(string bannerTitle, string bannerDescription)
    {
        await Assertions.Expect(BannerTitle).ToHaveTextAsync(bannerTitle);
        await Assertions.Expect(BannerDescription).ToHaveTextAsync(bannerDescription);
    }

    public async Task ClickCloseBannerButton() => await BannerCloseButton.ClickAsync();
}