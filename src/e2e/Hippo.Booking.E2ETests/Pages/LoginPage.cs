using Hippo.Booking.E2ETests.Support;
using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Pages;

public class LoginPage(IPage page)
{
    private ILocator H1Heading => page.Locator("h1");

    public async Task GoToPage()
    {
        await page.GotoAsync(Config.BaseUrl);
    }

    public async Task AssertPage()
    {
        await Assertions.Expect(page).ToHaveURLAsync($"{Config.BaseUrl}signin?returnUrl=/");
        await Assertions.Expect(H1Heading).ToHaveTextAsync("Hippo Reserve");
    }

    public async Task LogInWithGoogleAuth()
    {
        var signInButtonFrame = page.FrameLocator("[title='Sign in with Google Button']");
        
        var popup = await page.RunAndWaitForPopupAsync(async () =>
        {
            await signInButtonFrame.Locator("[role='button']").ClickAsync();
        });

        await popup.Locator("h1", new PageLocatorOptions {HasText = "Sign in"}).WaitForAsync();
        var emailInput = popup.Locator("input[type='email']");
        await emailInput.FillAsync(Config.UserEmail);
        var nextButton = popup.Locator("button").GetByText("Next");
        await nextButton.ClickAsync();
        
        var passwordInput = popup.Locator("input[type='password']").First;
        await passwordInput.WaitForAsync();
        
        await passwordInput.FillAsync(Config.UserPassword);
        await nextButton.ClickAsync();
    }
}