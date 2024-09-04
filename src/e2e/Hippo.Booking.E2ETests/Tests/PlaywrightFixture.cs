using Hippo.Booking.E2ETests.Pages;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Tests;

[SetUpFixture]
public abstract class PlaywrightFixture
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
        _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = false
        });

        _context = await _browser.NewContextAsync(new BrowserNewContextOptions
        {
            IgnoreHTTPSErrors = true
        });
        
        Page = await _context.NewPageAsync();
        
        await LogInToService();
    }

    [OneTimeSetUp]
    public async Task SeedData()
    {
        var seeding = new Seeding();
        await seeding.SeedOfficeData();
    }

    private async Task LogInToService()
    {
        var loginPage = new LoginPage(Page);
        await loginPage.GoToPage();
        await loginPage.AssertPage();
        await loginPage.LogInWithGoogleAuth();

        var homePage = new HomePage(Page);
        await homePage.AssertPage();
    }
    
    [OneTimeTearDown]
    public async Task Teardown()
    {
        await _context.CloseAsync();
        await _browser.CloseAsync(); 
        _playwright.Dispose();
    }
}