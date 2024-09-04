using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class BookingPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Pick a space" });
    
    private ILocator DateInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Choose a date:" });
    private ILocator TodayButton => page.GetByLabel("Today");
    private ILocator NextButton => page.GetByLabel("next date");
    private ILocator PreviousButton => page.GetByLabel("previous date");

    private ILocator FloorPlanTabButton => page.GetByRole(AriaRole.Tab, new() {Name = "Floorplan"});
    private ILocator FloorPlanTab => page.GetByRole(AriaRole.Tabpanel, new() {Name = "Floorplan"});
    private ILocator ListTabButton => page.GetByRole(AriaRole.Tab, new() {Name = "List"});
    private ILocator ListTab => page.GetByRole(AriaRole.Tabpanel, new() {Name = "List"});

    private ILocator BookableObjectListButton(string spaceName) =>
        ListTab.GetByRole(AriaRole.Button, new() {Name = spaceName + " - "});

    private ILocator ConfirmationModal => page.GetByRole(AriaRole.Alertdialog);
    
    private ILocator ModalHeading(string headingText) =>
        ConfirmationModal.GetByRole(AriaRole.Heading, new() {Name = headingText});
    
    private ILocator ConfirmBookingButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "Yes. Book it"}); 
    private ILocator CloseModalButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "No. Cancel"}); 

    public async Task AssertBookingPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl + "locations/**/areas/**");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();

        await Assertions.Expect(DateInput).ToBeVisibleAsync();
        await Assertions.Expect(TodayButton).ToBeVisibleAsync();
        await Assertions.Expect(NextButton).ToBeVisibleAsync();
        await Assertions.Expect(PreviousButton).ToBeVisibleAsync();
        
        await Assertions.Expect(FloorPlanTabButton).ToBeVisibleAsync();
        await Assertions.Expect(ListTabButton).ToBeVisibleAsync();
    }

    public async Task OpenFloorPlanTab()
    {
        if (!await FloorPlanTab.IsVisibleAsync())
        {
            await FloorPlanTabButton.ClickAsync();
        }
        await Assertions.Expect(FloorPlanTab).ToBeVisibleAsync();
    }
    
    public async Task OpenListTab()
    {
        if (!await ListTab.IsVisibleAsync())
        {
            await ListTabButton.ClickAsync();
        }
        await Assertions.Expect(ListTab).ToBeVisibleAsync();
    }

    public async Task InputDate(DateOnly date)
    {
        await DateInput.FillAsync(date.ToString("dd/MM/yyyy"));
    }

    public async Task ClickOnListedBookableObject(string spaceName)
    {
        await BookableObjectListButton(spaceName).ClickAsync();
    }

    public async Task AssertModalForAvailableSpace(string selectedSpaceName)
    {
        await Assertions.Expect(ConfirmationModal).ToBeVisibleAsync();
        await Assertions.Expect(ModalHeading(selectedSpaceName)).ToBeVisibleAsync();
        await Assertions.Expect(ConfirmBookingButton).ToBeVisibleAsync(); 
        await Assertions.Expect(CloseModalButton).ToBeVisibleAsync(); 
    }

    public async Task ClickCloseModalButton() => await CloseModalButton.ClickAsync();
    
    public async Task ClickConfirmBookingButton() => await ConfirmBookingButton.ClickAsync();
}