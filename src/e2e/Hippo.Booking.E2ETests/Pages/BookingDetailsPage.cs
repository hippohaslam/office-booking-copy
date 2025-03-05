using System.Text.RegularExpressions;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class BookingDetailsPage(IPage page)
{
    private ILocator BackLink => page.GetByRole(AriaRole.Link, new() { Name = "Back to my bookings" });
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Booking details" });
    private ILocator BookingDetailsTable => page.GetByRole(AriaRole.Table, new() { Name = "Details" });
    private ILocator CancelBookingButton => page.GetByRole(AriaRole.Button, new() { Name = "Cancel booking" });
    
    private ILocator ConfirmationModal => page.GetByRole(AriaRole.Alertdialog,
        new() {Name = "Are you sure you want to cancel this booking?"});

    private ILocator ModalConfirmButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "Yes. Cancel it"});
    private ILocator CloseModalButton => ConfirmationModal.GetByRole(AriaRole.Button, new() {Name = "No. Keep it"});
    
    public async Task AssertBookingDetailsPage()
    {
        await Assertions.Expect(page).ToHaveURLAsync(new Regex(Config.BaseUrl + @"bookings\/[^\/]+\/details$"));
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
        await Assertions.Expect(BookingDetailsTable).ToBeVisibleAsync();
        await Assertions.Expect(CancelBookingButton).ToBeVisibleAsync();
    }

    public async Task AssertBookingRow(DateOnly date, string bookableObjectName, string areaName, string locationName)
    {
        var expectedHeaders = new[] { "Date", "Bookable object", "Area", "Location" };
        var expectedValues = new[] 
        {
            date.ToString("dddd d MMMM yyyy"), 
            bookableObjectName, 
            areaName, 
            locationName
        };

        for (int i = 0; i < expectedHeaders.Length; i++)
        {
            await Assertions.Expect(BookingDetailsTable.Locator("tr").Nth(i + 1).Locator("td").Nth(0)).ToHaveTextAsync(expectedHeaders[i]);
            await Assertions.Expect(BookingDetailsTable.Locator("tr").Nth(i + 1).Locator("td").Nth(1)).ToHaveTextAsync(expectedValues[i]);
        }
    }
    
    public async Task ClickDeleteBookingButton() => await CancelBookingButton.ClickAsync();
    
    public async Task ClickBackLink() => await BackLink.ClickAsync();
    
    
    public async Task AssertConfirmationModal()
    {
        await Assertions.Expect(ConfirmationModal).ToBeVisibleAsync();
        await Assertions.Expect(ModalConfirmButton).ToBeVisibleAsync();
        await Assertions.Expect(CloseModalButton).ToBeVisibleAsync();
    }

    public async Task ClickModalConfirmButton() => await ModalConfirmButton.ClickAsync();
    
    public async Task ClickCloseModalButton() => await CloseModalButton.ClickAsync();
}