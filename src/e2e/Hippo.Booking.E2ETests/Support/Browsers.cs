using Microsoft.Playwright;

namespace Hippo.Booking.E2ETests.Support;

public static class Browsers
{
    public static void InstallRequiredBrowsers()
    {
        var exitCode = Program.Main(["install", "chromium"]);
        if (exitCode != 0)
        {
            throw new Exception($"Playwright exited with code {exitCode}");
        }
    }
}