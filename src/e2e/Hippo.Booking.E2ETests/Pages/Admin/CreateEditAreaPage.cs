using Hippo.Booking.Core.Entities;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.Admin;

public class CreateEditAreaPage(IPage page)
{
    private ILocator BackToLocationsLink => page.GetByRole(AriaRole.Link, new() { Name = "Back to locations" });
    private ILocator H1Heading(string locationName) =>
        page.GetByRole(AriaRole.Heading, new() {Name = "Create a new area " + locationName});
    
    private ILocator AreaNameInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Name" });
    private ILocator DescriptionInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Description" });
    private ILocator AreaTypeSelect => page.GetByRole(AriaRole.Combobox, new() { Name = "Area Type" });
    private ILocator SubmitButton => page.GetByRole(AriaRole.Button, new() { Name = "Submit" });
    
    public async Task AssertCreateEditAreaPage(StateHelper.CreateEditState state, string locationName)
    {
        await page.WaitForURLAsync(Config.BaseUrl + "admin/locations/**/areas/" + state.ToString().ToLower());
        await Assertions.Expect(BackToLocationsLink).ToBeVisibleAsync();
        await Assertions.Expect(H1Heading(locationName)).ToBeVisibleAsync();
        await Assertions.Expect(AreaNameInput).ToBeVisibleAsync();
        await Assertions.Expect(DescriptionInput).ToBeVisibleAsync();
        await Assertions.Expect(AreaTypeSelect).ToBeVisibleAsync();
        await Assertions.Expect(SubmitButton).ToBeVisibleAsync();
    }
    
    public async Task FillInAndSubmitAreaDetails(Area area)
    {
        await AreaNameInput.FillAsync(area.Name);
        await DescriptionInput.FillAsync(area.Description);
        await AreaTypeSelect.SelectOptionAsync(area.AreaType.Name);
        await SubmitButton.ClickAsync();
    }

    public async Task ClickBackLink()
    {
        await BackToLocationsLink.ClickAsync();
    }
}