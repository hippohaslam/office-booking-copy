using Hippo.Booking.Core.Entities;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.Admin;

public class CreateEditLocationPage(IPage page)
{
    private ILocator BackToLocationsLink => page.GetByRole(AriaRole.Link, new() { Name = "Admin" }).First;
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Create a new location" });
    private ILocator NameInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Name" });
    private ILocator DescriptionInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Description" });
    private ILocator AddressInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Address" });
    private ILocator SlackChannelInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Slack channel link" });
    private ILocator GuideLinkInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Office guide link" });
    private ILocator SubmitButton => page.GetByRole(AriaRole.Button, new() { Name = "Save location" });
    
    public async Task AssertCreateEditLocationPage(StateHelper.CreateEditState state)
    {
        await page.WaitForURLAsync(Config.BaseUrl + "admin/locations/" +
                                   (state == StateHelper.CreateEditState.New ? "new" : "edit"));
        await Assertions.Expect(BackToLocationsLink).ToBeVisibleAsync();
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
        await Assertions.Expect(NameInput).ToBeVisibleAsync();
        await Assertions.Expect(DescriptionInput).ToBeVisibleAsync();
        await Assertions.Expect(AddressInput).ToBeVisibleAsync();
        await Assertions.Expect(SlackChannelInput).ToBeVisibleAsync();
        await Assertions.Expect(GuideLinkInput).ToBeVisibleAsync();
        await Assertions.Expect(SubmitButton).ToBeVisibleAsync();
    }

    public async Task FillInAndSubmitLocationDetails(Location location)
    {
        await NameInput.FillAsync(location.Name);
        await DescriptionInput.FillAsync(location.Description);
        await AddressInput.FillAsync(location.Address);
        await SlackChannelInput.FillAsync(location.SlackChannel);
        await GuideLinkInput.FillAsync(location.GuideLink);
        await SubmitButton.ClickAsync();
    }

    public async Task ClickBackButton()
    {
        await BackToLocationsLink.ClickAsync();
    }
}