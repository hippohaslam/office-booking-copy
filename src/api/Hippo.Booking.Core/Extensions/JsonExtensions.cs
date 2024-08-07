using System.Text.Json;

namespace Hippo.Booking.Core.Extensions;

public static class JsonExtensions
{
    private static readonly JsonSerializerOptions _options = new()
    {
        PropertyNameCaseInsensitive = true, 
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    
    public static T? FromJson<T>(this string json)
    {
        return JsonSerializer.Deserialize<T>(json, _options);
    }
    
    public static string ToJson<T>(this T obj)
    {
        return JsonSerializer.Serialize(obj, _options);
    }
}