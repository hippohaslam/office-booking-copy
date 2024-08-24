using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Tests;

public abstract class PlaywrightBaseTest
{
    private IPlaywright _playwright = null!;
    private IBrowser _browser = null!;
    private IBrowserContext _context = null!;
    
    protected IPage Page { get; private set; } = null!;
    
    [OneTimeSetUp]
    public async Task Setup()
    {
        Browsers.InstallRequiredBrowsers();
        
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync();

        _context = await _browser.NewContextAsync(new BrowserNewContextOptions()
        {
            IgnoreHTTPSErrors = true
        });
        
        Page = await _context.NewPageAsync();
    }
    
    [OneTimeTearDown]
    public async Task Teardown()
    {
        await _context.CloseAsync();
        await _browser.CloseAsync(); 
        _playwright.Dispose();
    }
}