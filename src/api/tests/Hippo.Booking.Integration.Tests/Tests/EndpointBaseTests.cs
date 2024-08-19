using System.Net;
using FluentAssertions;
using Hippo.Booking.Core.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace Hippo.Booking.Integration.Tests.Tests;

public class EndpointBaseTests : IntegrationTestBase
{
    [Test]
    public async Task TestThatClientExceptionIsHandledAsBadRequest()
    {
        //Arrange
        var client = GetClient();
        
        //Act
        var response = await client.GetAsync("test/bad-request");
        var responseString = await response.Content.ReadAsStringAsync();
        
        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        responseString.Should().Be("\"Bad request message\"");
    }
    
    [Test]
    public async Task TestThatClientForbiddenExceptionIsHandledAsForbidden()
    {
        //Arrange
        var client = GetClient();
        
        //Act
        var response = await client.GetAsync("test/forbidden");
        
        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
    
    [Test]
    public async Task TestThatValidationExceptionIsHandledAsBadRequest()
    {
        //Arrange
        var client = GetClient();
        
        //Act
        var response = await client.GetAsync("test/validation-problem");
        var responseString = await response.Content.ReadAsStringAsync();
        var validationProblem = responseString.FromJson<ValidationProblemDetails>();
        
        //Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        validationProblem.Should().BeEquivalentTo(new ValidationProblemDetails
        {
            Status = 400,
            Title = "One or more validation errors occurred.",
            Errors = { ["Name"] = ["'Name' must not be empty."] }
        }, x => x.Excluding(y => y.Type));
    }
}