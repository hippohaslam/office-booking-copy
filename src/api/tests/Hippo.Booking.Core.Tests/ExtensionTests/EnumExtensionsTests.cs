using FluentAssertions;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Core.Tests.ExtensionTests;

public class EnumExtensionsTests
{
    public enum TestEnum
    {
        [System.ComponentModel.Description("Test Description 1")]
        TestValue1,
        TestValue2
    }
    
    [TestCase(TestEnum.TestValue1, "Test Description 1")]
    [TestCase(TestEnum.TestValue2, "TestValue2")]
    public void TestGetEnumDescriptionInputOutput(TestEnum enumVal, string expectedVal)
    {
        var result = enumVal.GetEnumDescription();

        result.Should().Be(expectedVal);
    }
}