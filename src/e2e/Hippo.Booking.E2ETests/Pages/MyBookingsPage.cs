using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class MyBookingsPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "My bookings" });

    private ILocator BookingsForDateTable() =>
        page.GetByRole(AriaRole.Table, new() {Name = "Bookings"});
    
    private ILocator BookingRow(DateOnly date, string bookableObjectName, string areaName, string locationName) =>
        BookingsForDateTable().GetByRole(AriaRole.Row).Filter(new LocatorFilterOptions
            {HasText = date.ToString("dddd dd MMMM yyyy") + bookableObjectName + areaName + locationName});

    private ILocator
        CancelBookingButton(DateOnly date, string bookableObjectName, string areaName, string locationName) =>
        BookingRow(date, bookableObjectName, areaName, locationName)
            .GetByRole(AriaRole.Button, new() {Name = "Cancel booking"});
    
    private ILocator MakeNewBookingCta => page.GetByRole(AriaRole.Link, new() {Name = "Make a new booking"});
    
    private ILocator ConfirmationModal => page.GetByRole(AriaRole.Alertdialog,
        new() {Name = "Are you sure you want to cancel this booking?"});

    private ILocator ModalConfirmButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "Yes. Cancel it"});
    private ILocator CloseModalButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "No. Keep it"});
    
    public async Task AssertMyBookingsPage()
    {
        await page.WaitForURLAsync(Config.BaseUrl + "bookings");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
    }
    
    public async Task AssertBookingRow(DateOnly date, string bookableObjectName, string areaName, string locationName)
    {
        await Assertions.Expect(BookingRow(date, bookableObjectName, areaName, locationName)).ToBeVisibleAsync();
    }
    
    public async Task AssertBookingRowNotShown(DateOnly date, string bookableObjectName, string areaName, string locationName)
    {
        await Assertions.Expect(BookingRow(date, bookableObjectName, areaName, locationName)).ToHaveCountAsync(0);
    }
    
    public async Task ClickCancelBookingButton(DateOnly date, string bookableObjectName, string areaName, string locationName)
    {
        await CancelBookingButton(date, bookableObjectName, areaName, locationName).ClickAsync();
    }
    
    public async Task ClickMakeNewBookingCta() => await MakeNewBookingCta.ClickAsync();

    public async Task AssertConfirmationModal()
    {
        await Assertions.Expect(ConfirmationModal).ToBeVisibleAsync();
        await Assertions.Expect(ModalConfirmButton).ToBeVisibleAsync();
        await Assertions.Expect(CloseModalButton).ToBeVisibleAsync();
    }
    
    public async Task ClickModalConfirmButton() => await ModalConfirmButton.ClickAsync();
    
    public async Task ClickCloseModalButton() => await CloseModalButton.ClickAsync();
}