namespace Hippo.Booking.Core.Extensions;

public static class TypeExtensions
{
    public static bool IsImplementationOf<TInterface>(this Type baseType)
    {
        return IsImplementationOf(baseType, typeof(TInterface));
    }

    public static bool IsImplementationOf(this Type baseType, Type interfaceType)
    {
        return baseType.GetInterfaces().Any(interfaceType.Equals);
    }
}