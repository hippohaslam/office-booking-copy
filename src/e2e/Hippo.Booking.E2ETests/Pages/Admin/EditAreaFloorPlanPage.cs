using Hippo.Booking.Core.Entities;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.Admin;

public class EditAreaFloorPlanPage(IPage page)
{
    private ILocator H1Heading(string areaName) => page.GetByRole(AriaRole.Heading, new() { Name = areaName });
    private ILocator AreaNameInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Area name" });
    private ILocator SaveChangesButton => page.GetByRole(AriaRole.Button, new() { Name = "Save changes" });
    private ILocator CanvasContainer => page.Locator(".canvas-container");

    private ILocator CreateNewBookableObjectButton =>
        page.GetByRole(AriaRole.Button, new() { Name = "Create a new bookable object" });
    private ILocator BookableObjectNameInput => 
        page.GetByRole(AriaRole.Textbox, new() { Name = "Name: ", Exact = true });
    private ILocator BookableObjectDescriptionInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Description "});
    private ILocator BookableObjectTypeSelect => page.GetByRole(AriaRole.Combobox, new() { Name = "Type" });
    private ILocator CreateBookableObjectButton =>
        page.GetByRole(AriaRole.Button, new() {Name = "Create", Exact = true});
    private ILocator CancelBookableObjectButton => page.GetByRole(AriaRole.Button, new() { Name = "Cancel" });
    
    private ILocator AddCircleButton() => page.GetByRole(AriaRole.Button, new() { Name = "Add circle" });

    private ILocator BookableObjectsList(bool isAssigned) =>
        page.GetByTestId(isAssigned ? "assigned-list" : "unassigned-list");
    
    private ILocator BookableObjectAccordion(string bookableObjectName, bool isAssigned) =>
        BookableObjectsList(isAssigned).GetByText(bookableObjectName).First;
    private ILocator AssignDeskButton() => page.GetByRole(AriaRole.Button, new() { Name = "Assign desk", Exact = true});
    
    public async Task AssertEditAreaFloorPlanPage(string areaName)
    {
        await page.WaitForURLAsync(Config.BaseUrl + "admin/locations/**/area/**");
        await Assertions.Expect(H1Heading(areaName)).ToBeVisibleAsync();
        await Assertions.Expect(AreaNameInput).ToBeVisibleAsync();
        await Assertions.Expect(SaveChangesButton).ToBeVisibleAsync();
        await Assertions.Expect(CanvasContainer).ToBeVisibleAsync();
        await Assertions.Expect(CreateNewBookableObjectButton).ToBeVisibleAsync();
    }
    
    public async Task ClickCreateNewBookableObjectButton()
    {
        await CreateNewBookableObjectButton.ClickAsync();
    }

    public async Task AssertCreateNewBookableObjectForm()
    {
        await Assertions.Expect(BookableObjectNameInput).ToBeVisibleAsync();
        await Assertions.Expect(BookableObjectDescriptionInput).ToBeVisibleAsync();
        await Assertions.Expect(BookableObjectTypeSelect).ToBeVisibleAsync();
    }

    public async Task FillOutCreateNewBookableObjectFormAndSubmit(BookableObject bookableObject)
    {
        await BookableObjectNameInput.FillAsync(bookableObject.Name);
        await BookableObjectDescriptionInput.FillAsync(bookableObject.Description);
        await BookableObjectTypeSelect.SelectOptionAsync(bookableObject.BookableObjectType.Name);
        await CreateBookableObjectButton.ClickAsync();
    }
    
    public async Task ClickCancelBookableObjectButton()
    {
        await CancelBookableObjectButton.ClickAsync();
    }

    public async Task AssertBookableObjectInList(string bookableObjectName, bool isAssigned)
    {
        await Assertions.Expect(BookableObjectAccordion(bookableObjectName, isAssigned)).ToBeVisibleAsync();
    }

    public async Task ClickSaveChangesButton()
    {
        await SaveChangesButton.ClickAsync();
    }

    public async Task AddCircleToFloorPlan()
    {
        await AddCircleButton().ClickAsync();
    }

    public async Task AssignBookableObjectToCircle(string bookableObjectName)
    {
        var canvasBoundingBox = await CanvasContainer.BoundingBoxAsync();
        if (canvasBoundingBox == null)
        {
            throw new Exception("No bounding box values returned for canvas container");
        }

        await BookableObjectAccordion(bookableObjectName, false).ClickAsync();
        await page.Mouse.ClickAsync(canvasBoundingBox.X + 130, canvasBoundingBox.Y + 130);
        await AssignDeskButton().ClickAsync();
    }
}