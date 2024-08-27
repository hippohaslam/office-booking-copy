using Hippo.Booking.E2ETests.Pages;

namespace Hippo.Booking.E2ETests.Tests;

[Parallelizable(ParallelScope.Self)]
[TestFixture]
public class LoginTests : BasePageTest
{
    [Test]
    public async Task NavigateToAndAssertLoginPage()
    {
        var loginPage = new LoginPage(Page);

        await loginPage.GoToPage();
        await loginPage.AssertPage();
    }
}