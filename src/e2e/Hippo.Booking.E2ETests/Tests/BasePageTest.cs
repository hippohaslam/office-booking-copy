using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;

namespace Hippo.Booking.E2ETests.Tests;

public class BasePageTest : PageTest
{
    [OneTimeSetUp]
    public void InstallBrowsers()
    {
        Browsers.InstallRequiredBrowsers();
    }
    
    public override BrowserNewContextOptions ContextOptions()
    {
        var options = base.ContextOptions();

        options.IgnoreHTTPSErrors = true;
        
        return options;
    }
}