using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Hippo.Booking.Application.Tests;

public class MediatorTests
{
    private Mediator _mediator;
    
    [SetUp]
    public void Setup()
    {
        IServiceCollection services = new ServiceCollection();
        
        services
            .AddHippoBookingApplication()
            .AddScoped<IHandler<TestRequest>, TestHandler>()
            .AddScoped<IValidator<TestRequest>, TestRequestValidator>();

        var serviceProvider = services.BuildServiceProvider();

        _mediator = new Mediator(serviceProvider);
    }

    [Test]
    public async Task MediatorResolvesTestRequestHandler()
    {
        var request = new TestRequest
        {
            TestProperty = "Test"
        };
        
        await _mediator.Execute(request);
        
        request.HandlerRun.Should().BeTrue();
    }
    
    [Test]
    public async Task MediatorValidatesRequest()
    {
        var request = new TestRequest();
        
        var act = async () => await _mediator.Execute(request);
        
        await act.Should().ThrowAsync<ValidationException>();
    }
    
    [Test]
    public async Task MediatorThrowsNotImplementedIfHandlerNotFound()
    {
        var request = new MediatorTests();
        
        var act = async () => await _mediator.Execute(request);
        
        await act.Should().ThrowAsync<NotImplementedException>();
    }
    
    class TestRequest
    {
        public bool HandlerRun { get; set; }
        
        public string TestProperty { get; set; } = string.Empty;
    }
    
    class TestHandler : IHandler<TestRequest>
    {
        public Task Handle(TestRequest request)
        {
            request.HandlerRun = true;
            return Task.CompletedTask;
        }
    }

    class TestRequestValidator : AbstractValidator<TestRequest>
    {
        public TestRequestValidator()
        {
            RuleFor(x => x.TestProperty).NotEmpty();
        }
    }
}