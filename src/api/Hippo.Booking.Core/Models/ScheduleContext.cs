using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Core.Models;

public class ScheduleContext(string payloadJson)
{
    public T GetPayload<T>() where T : new()
    {
        return payloadJson.FromJson<T>() ?? new T();
    }
}