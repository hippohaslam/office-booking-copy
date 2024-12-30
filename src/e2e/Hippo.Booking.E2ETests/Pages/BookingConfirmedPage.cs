using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class BookingConfirmedPage(IPage page)
{
    private ILocator H1Heading => page.GetByRole(AriaRole.Heading, new() { Name = "Booking confirmed" });
    private ILocator MyBookingsCta => page.GetByRole(AriaRole.Link, new() {Name = "Manage this and other bookings"});
    private ILocator BookAgainCta => page.GetByRole(AriaRole.Link, new() {Name = "Book again at "});
    private ILocator BookingDetailsDate => page.GetByLabel("date");
    private ILocator BookingDetailsBookableObject => page.GetByLabel("space");
    private ILocator BookingDetailsArea => page.GetByLabel("area");
    private ILocator BookingDetailsLocation => page.GetByLabel("location");
    
    public async Task AssertBookingConfirmedPage()
    {
        await Assertions.Expect(page).ToHaveURLRegexMatchAsync(@"bookings\/\d*\/confirmed");
        await Assertions.Expect(H1Heading).ToBeVisibleAsync();
    }
    
    public async Task AssertBookingDetails(DateOnly date, string bookableObject, string area, string location)
    {
        await Assertions.Expect(BookingDetailsDate).ToHaveTextAsync(date.ToString("dddd d MMMM yyyy"));
        await Assertions.Expect(BookingDetailsBookableObject).ToHaveTextAsync(bookableObject);
        await Assertions.Expect(BookingDetailsArea).ToHaveTextAsync(area);
        await Assertions.Expect(BookingDetailsLocation).ToHaveTextAsync(location);
    }
    
    public async Task ClickOnMyBookingsCta() => await MyBookingsCta.ClickAsync();
    
    public async Task ClickOnBookAgainCta() => await BookAgainCta.ClickAsync();
}