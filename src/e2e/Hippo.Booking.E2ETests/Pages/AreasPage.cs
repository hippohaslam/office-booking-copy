using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class AreasPage(IPage page)
{
    private ILocator H1Heading(string locationName) => page.GetByRole(AriaRole.Heading, new() { Name = locationName });
    private ILocator H2Heading => page.GetByRole(AriaRole.Heading, new() {Name = "What would you like to book?"});

    private ILocator AreaTile(string areaName) =>
        page.GetByTestId("area-tile").Filter(new LocatorFilterOptions {HasText = areaName});
    
    private ILocator BookInThisAreaLink(string areaName) =>
        AreaTile(areaName).GetByRole(AriaRole.Link, new() {Name = "Book in this area"});

    public async Task AssertAreasPage(string locationName)
    {
        await page.WaitForURLAsync(Config.BaseUrl + "locations/**/areas");
        await Assertions.Expect(H1Heading(locationName)).ToBeVisibleAsync();
        await Assertions.Expect(H2Heading).ToBeVisibleAsync();
    }
    
    public async Task ClickBookInThisAreaLink(string areaName) => await BookInThisAreaLink(areaName).ClickAsync();
}