using System.Diagnostics;
using Amazon.S3;
using Amazon.S3.Model;
using Hippo.Booking.E2ETests.Pages;
using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;
using NUnit.Framework.Interfaces;

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
        var db = await Config.GetDbContext();
        var seeding = new Seeding(db);
        await seeding.SeedOfficeData();
        await seeding.SetUserAsAdmin();
        
        Browsers.InstallRequiredBrowsers();
        
        _playwright = await Playwright.CreateAsync();
        _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
        {
            Headless = Config.Headless
        });

        _context = await _browser.NewContextAsync(new BrowserNewContextOptions
        {
            IgnoreHTTPSErrors = true
        });
        
        await _context.Tracing.StartAsync(new TracingStartOptions()
        {
            Screenshots = true,
            Snapshots = true
        });
        
        Page = await _context.NewPageAsync();
        
        // REPLACE BypassAuthToHomePage() with LogInToService() when Google Auth is working again
        // await LogInToService();
        await BypassAuthToHomePage();
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

    private async Task BypassAuthToHomePage()
    {
        var loginPage = new LoginPage(Page);
        await loginPage.GoToPage();
        
        var homePage = new HomePage(Page);
        await homePage.AssertPage();
    }
    
    [OneTimeTearDown]
    public async Task Teardown()
    {
        var zipPath = $"trace-{DateTime.Now:yyyyMMddHHmmss}.zip";
        
        await _context.Tracing.StopAsync(new()
        {
            Path = zipPath
        });
        
        await _context.CloseAsync();
        await _browser.CloseAsync(); 
        _playwright.Dispose();

        var s3Bucket = Config.PlaywrightS3Bucket;
        
        var failedStates = new[]
        {
            ResultState.Error, 
            ResultState.Failure, 
            ResultState.ChildFailure, 
            ResultState.SetUpError,
            ResultState.SetUpFailure
        };
        
        if (!string.IsNullOrEmpty(s3Bucket)
            && failedStates.Contains(TestContext.CurrentContext.Result.Outcome))
        {
            var s3Client = new AmazonS3Client();
            
            var putObjectRequest = new PutObjectRequest
            {
                BucketName = s3Bucket,
                Key = zipPath,
                FilePath = zipPath
            };

            var resp = await s3Client.PutObjectAsync(putObjectRequest);
            
            var url = await s3Client.GetPreSignedURLAsync(new GetPreSignedUrlRequest
            {
                BucketName = s3Bucket,
                Key = zipPath,
                Expires = DateTime.Now.AddHours(1)
            });
            
            await TestContext.Progress.WriteLineAsync("Tracing zip uploaded to S3: " + url);
            await TestContext.Progress.WriteLineAsync("Upload to https://trace.playwright.dev/ to view the trace. The link will expire after an hour.");
        }
    }
}