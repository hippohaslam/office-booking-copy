using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.E2ETests.Pages.Admin;
using Hippo.Booking.E2ETests.Pages.SharedComponents;
using Hippo.Booking.E2ETests.Support;

namespace Hippo.Booking.E2ETests.Tests;

[TestFixture]
public class AdminTests : PlaywrightFixture
{
    [Test]
    public async Task AdminCanCreateANewOffice()
    {
        var header = new HeaderComponent(Page);
        await header.ClickAdminNavLink();

        var adminPage = new AdminPage(Page);
        await adminPage.AssertAdminPage();
        await adminPage.ClickAddNewLocationButton();
        
        var location = new Location
        {
            Name = Faker.Address.City(),
            Description = Faker.Lorem.Sentence(),
            Address = Faker.Address.StreetAddress(),
            SlackChannel = Faker.Internet.Url(),
            GuideLink = Faker.Internet.Url()
        };
        var addLocationPage = new CreateEditLocationPage(Page);
        await addLocationPage.AssertCreateEditLocationPage(StateHelper.CreateEditState.New);
        await addLocationPage.FillInAndSubmitLocationDetails(location);

        await adminPage.AssertLocationExists(location.Name);
        await adminPage.ClickAddAreaButton(location.Name);

        var area = new Area
        {
            Name = "Floor " + Faker.RandomNumber.Next(1, 10000),
            Description = Faker.Lorem.Sentence(),
            AreaType = new AreaType
            {
                Id = AreaTypeEnum.Desks,
                Name = "Desks"
            }
        };
        var createEditAreaPage = new CreateEditAreaPage(Page);
        await createEditAreaPage.AssertCreateEditAreaPage(StateHelper.CreateEditState.New, location.Name);
        await createEditAreaPage.FillInAndSubmitAreaDetails(area);
        
        await adminPage.AssertLocationAreasList(location.Name, [area.Name]);
        await adminPage.ClickAreaLink(location.Name, area.Name);

        var bookableObject = new BookableObject
        {
            Name = "Desk " + Faker.RandomNumber.Next(1, 10000),
            Description = Faker.Lorem.Sentence(),
            BookableObjectType = new BookableObjectType
            {
                Name = "Standard",
                Id = BookableObjectTypeEnum.Standard
            }
        };

        var createEditAreaFloorPlanPage = new EditAreaFloorPlanPage(Page);
        await createEditAreaFloorPlanPage.AssertEditAreaFloorPlanPage();
        await createEditAreaFloorPlanPage.ClickCreateNewBookableObjectButton();
        await createEditAreaFloorPlanPage.AssertCreateNewBookableObjectForm();
        await createEditAreaFloorPlanPage.ClickCancelBookableObjectButton();
        await createEditAreaFloorPlanPage.ClickCreateNewBookableObjectButton();
        await createEditAreaFloorPlanPage.AssertCreateNewBookableObjectForm();
        await createEditAreaFloorPlanPage.FillOutCreateNewBookableObjectFormAndSubmit(bookableObject);
        await createEditAreaFloorPlanPage.ToggleUnassignedItemsAccordion(1);
        await createEditAreaFloorPlanPage.AssertBookableObjectInUnassignedAccordion(bookableObject.Name);

        await createEditAreaFloorPlanPage.AddCircleToFloorPlan();
        await createEditAreaFloorPlanPage.AssignBookableObjectToCircle(bookableObject.Name);
        await createEditAreaFloorPlanPage.ToggleAssignedItemsAccordion(1);
        await createEditAreaFloorPlanPage.AssertBookableObjectInAssignedAccordion(bookableObject.Name);
        await createEditAreaFloorPlanPage.ClickSaveChangesButton();
        
        var banner = new BannerComponent(Page);
        await banner.AssertBanner("Saved successfully", "");

        await createEditAreaFloorPlanPage.UnassignBookableObject(bookableObject.Name);
        await createEditAreaFloorPlanPage.AssertBookableObjectInUnassignedAccordion(bookableObject.Name);
        await createEditAreaFloorPlanPage.ClickSaveChangesButton();
        await banner.AssertBanner("Saved successfully", "");
    }
}