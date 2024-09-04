using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class LocationsPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Choose a location" });

    private ILocator LocationTile(string locationName) => page.GetByTestId("location-tile")
        .Filter(new LocatorFilterOptions {HasText = locationName});
    
    private ILocator ViewMoreDetailsLink(string locationName) =>
        LocationTile(locationName).GetByRole(AriaRole.Link, new() {Name = "View more details"});
    
    private ILocator BookAtThisLocationLink(string locationName) =>
        LocationTile(locationName).GetByRole(AriaRole.Link, new() {Name = "Book at this location"});

    public async Task AssertLocationsPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl + "locations");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
    }
    
    public async Task ClickViewMoreDetailsLink(string locationName)
    {
        await ViewMoreDetailsLink(locationName).ClickAsync();
    }
    
    public async Task ClickBookAtThisLocationLink(string locationName)
    {
        await BookAtThisLocationLink(locationName).ClickAsync();
    }
}