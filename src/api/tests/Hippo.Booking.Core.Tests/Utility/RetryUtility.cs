namespace Hippo.Booking.Core.Tests.Utility;

public static class RetryUtility
{
    public static async Task<bool>  WaitForAsync(Func<bool> condition, int retryCount = 10, int delay = 1000)
    {
        for (var i = 0; i < retryCount; i++)
        {
            if (condition())
            {
                return true;
            }
            await Task.Delay(delay);
        }

        return false;
    }
}