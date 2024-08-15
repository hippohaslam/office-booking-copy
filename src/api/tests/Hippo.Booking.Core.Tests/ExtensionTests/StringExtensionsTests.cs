using FluentAssertions;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Core.Tests.ExtensionTests;

public class StringExtensionsTests
{
    [TestCase("", "")]
    [TestCase("Pascal", "Pascal")]
    [TestCase("PascalString", "Pascal String")]
    [TestCase("PascalStringWithMultipleWords", "Pascal String With Multiple Words")]
    [TestCase("PascalStringWithMultipleWordsAndNumbers123", "Pascal String With Multiple Words And Numbers123")]
    [TestCase("PascalStringWithMultipleWordsAndNumbers123AndSpecialCharacters!@#", "Pascal String With Multiple Words And Numbers123 And Special Characters!@#")]
    public void TestToFriendlyCase(string pascalString, string expected)
    {
        var friendlyCase = pascalString.ToFriendlyCase();
        friendlyCase.Should().Be(expected);
    }
}