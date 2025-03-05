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
            {HasText = date.ToString("dddd d MMMM yyyy") + bookableObjectName + areaName + locationName});

    private ILocator
        ManageBookingLink(DateOnly date, string bookableObjectName, string areaName, string locationName) =>
        BookingRow(date, bookableObjectName, areaName, locationName)
            .GetByRole(AriaRole.Button, new() {Name = "Manage booking"});
    
    private ILocator MakeNewBookingCta => page.GetByRole(AriaRole.Link, new() {Name = "Make a new booking"});
    private ILocator CalendarViewTabButton => page.GetByRole(AriaRole.Tab, new() {Name = "Calendar view"});
    private ILocator CalendarViewTabPanel => page.GetByRole(AriaRole.Tabpanel, new() {Name = "Calendar view"});
    private ILocator TableViewTabButton => page.GetByRole(AriaRole.Tab, new() {Name = "Table view"});
    private ILocator TableViewTabPanel => page.GetByRole(AriaRole.Tabpanel, new() {Name = "Table view"});
    private ILocator CalendarContainer => page.Locator(".calendar-container");
    private ILocator Calendar => CalendarContainer.Locator("table.calendar");
    private ILocator CalendarHeading(string text) => CalendarContainer.GetByRole(AriaRole.Heading, new() {Name = text});
    private ILocator CalendarBookingLink(string text) => Calendar.GetByRole(AriaRole.Link, new() {Name = text});
    
    public async Task AssertMyBookingsPage()
    {
        await Assertions.Expect(page).ToHaveURLAsync(Config.BaseUrl + "bookings");
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
    
    public async Task ClickManageBookingLink(DateOnly date, string bookableObjectName, string areaName, string locationName)
    {
        await ManageBookingLink(date, bookableObjectName, areaName, locationName).ClickAsync();
    }
    
    public async Task OpenTableViewTab()
    {
        await TableViewTabButton.ClickAsync();
        await Assertions.Expect(TableViewTabPanel).ToBeVisibleAsync();
    }

    public async Task AssertCalendar(string heading)
    {
        await Assertions.Expect(CalendarHeading(heading)).ToBeVisibleAsync();
        await Assertions.Expect(Calendar).ToBeVisibleAsync();
    }

    public async Task ClickCalendarBookingLink(string linkText)
    {
        await CalendarBookingLink(linkText).ClickAsync();
    }
}