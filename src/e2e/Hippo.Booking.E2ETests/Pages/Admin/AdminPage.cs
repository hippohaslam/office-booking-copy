using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.Admin;

public class AdminPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Admin" });
    private ILocator ReportingLink => page.GetByRole(AriaRole.Link, new() { Name = "Go to reporting dashboard" });
    private ILocator AddNewLocationButton => page.GetByRole(AriaRole.Button, new() { Name = "Add a new location" });

    private ILocator LocationContainer(string locationName) => page.GetByTestId("location-container")
        .Filter(new LocatorFilterOptions {Has = page.GetByRole(AriaRole.Heading, new() {Name = locationName})});
    
    private ILocator EditLocationLink(string locationName) =>
        LocationContainer(locationName).GetByRole(AriaRole.Link, new() { Name = locationName });

    private ILocator AddAreaButton(string locationName) =>
        LocationContainer(locationName).GetByRole(AriaRole.Button, new() {Name = "Add area"});

    private ILocator AreasList(string locationName) => LocationContainer(locationName).GetByRole(AriaRole.List);
    
    private ILocator AreaLink(string locationName, string areaName) =>
        AreasList(locationName).GetByRole(AriaRole.Link, new() {Name = areaName});

    public async Task AssertAdminPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl + "admin");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
        
        await Assertions.Expect(ReportingLink).ToBeVisibleAsync();
        await Assertions.Expect(AddNewLocationButton).ToBeVisibleAsync();
    }

    public async Task ClickAddNewLocationButton()
    {
        await AddNewLocationButton.ClickAsync();
    }
    
    public async Task AssertLocationExists(string locationName)
    {
        await Assertions.Expect(LocationContainer(locationName)).ToBeVisibleAsync();
    }
    
    public async Task ClickEditLocationLink(string locationName)
    {
        await EditLocationLink(locationName).ClickAsync();
    }

    public async Task ClickAddAreaButton(string locationName)
    {
        await AddAreaButton(locationName).ClickAsync();
    }
    
    public async Task AssertLocationAreasList(string locationName, List<string> expectedAreas)
    {
        foreach (var area in expectedAreas)
        {
            await Assertions.Expect(AreaLink(locationName, area)).ToBeVisibleAsync();
        }
    }
    
    public async Task ClickAreaLink(string locationName, string areaName)
    {
        await AreaLink(locationName, areaName).ClickAsync();
    }
}