using Hippo.Booking.E2ETests.Pages;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright.NUnit;

namespace Hippo.Booking.E2ETests.Tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class LoginTests : PageTest
{
    [OneTimeSetUp]
    public void InstallBrowsers()
    {
        Browsers.InstallRequiredBrowsers();
    }
    
    [Test]
    public async Task NavigateToAndAssertHomePage()
    {
        var homePage = new HomePage(Page);

        await homePage.GoToPage();
        await homePage.AssertPage();
    }
}