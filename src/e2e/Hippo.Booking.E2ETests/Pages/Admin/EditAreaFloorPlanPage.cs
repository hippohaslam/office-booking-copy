using Hippo.Booking.Core.Entities;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages.Admin;

public class EditAreaFloorPlanPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Edit area" });
    private ILocator AreaNameInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Area name" });
    private ILocator SaveChangesButton => page.GetByRole(AriaRole.Button, new() { Name = "Save all changes" });
    private ILocator CanvasContainer => page.Locator(".canvas-container");

    private ILocator CreateNewBookableObjectButton =>
        page.GetByRole(AriaRole.Button, new() { Name = "Create new bookable object" });
    private ILocator BookableObjectNameInput => 
        page.GetByRole(AriaRole.Textbox, new() { Name = "Name: ", Exact = true });
    private ILocator BookableObjectDescriptionInput => page.GetByRole(AriaRole.Textbox, new() { Name = "Description "});
    private ILocator BookableObjectTypeSelect => page.GetByRole(AriaRole.Combobox, new() { Name = "Type" });
    private ILocator CreateBookableObjectButton =>
        page.GetByRole(AriaRole.Button, new() {Name = "Create bookable object", Exact = true});
    private ILocator CancelBookableObjectButton => page.GetByRole(AriaRole.Button, new() { Name = "Cancel" });
    
    private ILocator AddCircleButton() => page.GetByRole(AriaRole.Button, new() { Name = "Add circle" });

    private ILocator UnassignedItemsAccordion(int unassignedCount) => page.GetByRole(AriaRole.Button,
        new() {Name = $"Unassigned places ({unassignedCount})"});

    private ILocator UnassignedItemsAccordionPanel => page.Locator("#accordion-panel-unassigned-places");
    private ILocator AssignButton(string bookableObject) => page.GetByLabel($"Assign {bookableObject} to selected object");
    private ILocator UnassignButton(string bookableObject) => page.GetByLabel($"Unassign {bookableObject}");

    private ILocator AssignedItemsAccordion(int assignedCount) =>
        page.GetByRole(AriaRole.Button, new() {Name = $"Assigned places ({assignedCount})"});
    
    private ILocator AssignedItemsAccordionPanel => page.Locator("#accordion-panel-assigned-places");
    
    public async Task AssertEditAreaFloorPlanPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl + "admin/locations/**/area/**");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
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
    
    public async Task ToggleUnassignedItemsAccordion(int unassignedCount)
    {
        await UnassignedItemsAccordion(unassignedCount).ClickAsync();
    }
    
    public async Task ToggleAssignedItemsAccordion(int assignedCount)
    {
        await AssignedItemsAccordion(assignedCount).ClickAsync();
    }

    public async Task AssertBookableObjectInUnassignedAccordion(string bookableObjectName)
    {
        await Assertions.Expect(UnassignedItemsAccordionPanel).ToBeVisibleAsync();
        await Assertions
            .Expect(UnassignedItemsAccordionPanel.GetByRole(AriaRole.Listitem).First)
            .ToHaveTextAsync(bookableObjectName + "Assign");
    }
    
    public async Task AssertBookableObjectInAssignedAccordion(string bookableObjectName)
    {
        await Assertions.Expect(AssignedItemsAccordionPanel).ToBeVisibleAsync();
        await Assertions
            .Expect(AssignedItemsAccordionPanel.GetByRole(AriaRole.Listitem).First)
            .ToHaveTextAsync(bookableObjectName + "Unassign");
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
        
        await page.Mouse.ClickAsync(canvasBoundingBox.X + 130, canvasBoundingBox.Y + 130);
        await AssignButton(bookableObjectName).ClickAsync();
    }

    public async Task UnassignBookableObject(string bookableObjectName)
    {
        await UnassignButton(bookableObjectName).ClickAsync();
    }
}