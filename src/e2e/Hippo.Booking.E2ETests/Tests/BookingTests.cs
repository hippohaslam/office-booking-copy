using Hippo.Booking.E2ETests.Pages;
using Hippo.Booking.E2ETests.Pages.SharedComponents;

namespace Hippo.Booking.E2ETests.Tests;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class BookingTests : PlaywrightFixture
{
    private DateTime _testBookingDate;
    
    [SetUp]
    public void SetUp()
    {
        var today = DateTime.Now;
        _testBookingDate = today.DayOfWeek switch
        {
            DayOfWeek.Saturday => today.AddDays(2),
            DayOfWeek.Sunday => today.AddDays(1),
            _ => today
        };
    }
    
    [Test]
    public async Task CreateAndCancelANewBooking()
    {
        var homePage = new HomePage(Page);
        await homePage.ClickMakeANewBookingCta();

        var locationsPage = new LocationsPage(Page);
        await locationsPage.AssertLocationsPage();
        await locationsPage.ClickBookAtThisLocationLink("Leeds - e2e test");
        
        var areasPage = new AreasPage(Page);
        await areasPage.AssertAreasPage("Leeds - e2e test");
        await areasPage.ClickBookInThisAreaLink("Floor 1");

        var bookingPage = new BookingPage(Page);
        await bookingPage.AssertBookingPage();
        await bookingPage.EnsureWeekdayBooking(_testBookingDate);
        await bookingPage.OpenListTab();
        await bookingPage.ClickOnListedBookableObject("Desk 1");
        await bookingPage.AssertModalForAvailableSpace("Desk 1");
        await bookingPage.ClickCloseModalButton();
        await bookingPage.ClickOnListedBookableObject("Desk 2");
        await bookingPage.AssertModalForAvailableSpace("Desk 2");
        await bookingPage.ClickConfirmBookingButton();
        
        var confirmationPage = new BookingConfirmedPage(Page);
        await confirmationPage.AssertBookingConfirmedPage();
        await confirmationPage.AssertBookingDetails(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1",
            "Leeds - e2e test");
        await confirmationPage.ClickOnMyBookingsCta();
        
        var myBookingsPage = new MyBookingsPage(Page);
        await myBookingsPage.AssertMyBookingsPage();
        await myBookingsPage.AssertCalendar(_testBookingDate.ToString("MMMM") + " " + DateTime.Today.ToString("yyyy"));
        await myBookingsPage.ClickCalendarBookingLink("Desk 2 - Floor 1 - Leeds - e2e test");
        
        var bookingDetailsPage = new BookingDetailsPage(Page);
        await bookingDetailsPage.AssertBookingDetailsPage();
        await bookingDetailsPage.AssertBookingRow(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1",
            "Leeds - e2e test");
        await bookingDetailsPage.ClickBackLink();
        
        await myBookingsPage.AssertMyBookingsPage();
        await myBookingsPage.OpenTableViewTab();
        await myBookingsPage.AssertBookingRow(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1",
            "Leeds - e2e test");
        await myBookingsPage.ClickManageBookingLink(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1",
            "Leeds - e2e test");

        await bookingDetailsPage.AssertBookingDetailsPage();
        await bookingDetailsPage.AssertBookingRow(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1",
            "Leeds - e2e test");
        await bookingDetailsPage.ClickDeleteBookingButton();
        await bookingDetailsPage.AssertConfirmationModal();
        await bookingDetailsPage.ClickCloseModalButton();
        await bookingDetailsPage.ClickDeleteBookingButton();
        await bookingDetailsPage.AssertConfirmationModal();
        await bookingDetailsPage.ClickModalConfirmButton();

        await myBookingsPage.AssertMyBookingsPage();
        var banner = new BannerComponent(Page);
        await banner.AssertBanner("Booking cancelled",
            "Your booking of Desk 2 at Floor 1, Leeds - e2e test on " + _testBookingDate.ToString("dddd d MMMM yyyy") +
            " has been cancelled.");
        await myBookingsPage.AssertBookingRowNotShown(DateOnly.FromDateTime(_testBookingDate), "Desk 2", "Floor 1", "Leeds - e2e test");
    }
}