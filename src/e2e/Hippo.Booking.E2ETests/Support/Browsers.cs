namespace Hippo.Booking.E2ETests.Support;

public static class Browsers
{
    public static void InstallRequiredBrowsers()
    {
        var exitCode = Microsoft.Playwright.Program.Main(new[] { "install" });
        if (exitCode != 0)
        {
            throw new Exception($"Playwright exited with code {exitCode}");
        }
    }
}