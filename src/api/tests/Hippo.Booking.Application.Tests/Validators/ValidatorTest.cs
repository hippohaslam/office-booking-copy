using FluentAssertions;
using FluentAssertions.Execution;
using FluentValidation;

namespace Hippo.Booking.Application.Tests.Validators;

public abstract class ValidatorTest<TInstance, TValidator>(TValidator validator) where TValidator : IValidator<TInstance>
{
    public abstract List<TInstance> PositiveTestCases { get; }

    public abstract List<TInstance> NegativeTestCases { get; }
    
    [Test]
    public void TestPositiveCases()
    {
        using (new AssertionScope())
        {
            var index = 0;
            foreach (var instance in PositiveTestCases)
            {
                var result = validator.Validate(instance);
                result.IsValid.Should().BeTrue("index {0} should succeed", index);
                index++;
            }
        }
    }
    
    [Test]
    public void TestNegativeCases()
    {
        using (new AssertionScope())
        {
            var index = 0;
            foreach (var instance in NegativeTestCases)
            {
                var result = validator.Validate(instance);
                result.IsValid.Should().BeFalse("index {0} should fail", index);
                index++;
            }
        }
    }
}