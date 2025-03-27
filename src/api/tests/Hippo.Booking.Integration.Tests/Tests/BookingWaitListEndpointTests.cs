using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Hippo.Booking.Application.Queries.BookingWaitingList;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Extensions;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class BookingWaitListEndpointTests : IntegrationTestBase
{
    private const string bookingRoot = "booking/waitlist";
    
    [OneTimeSetUp]
    public async Task BookingWaitListEndpointTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = "testuser",
            FirstName = "Test",
            LastName = "User",
            Email = "testuser@hippodigital.co.uk"
        });
        await AddEntity(new User
        {
            Id = "nottestwaitlistuser",
            FirstName = "notTest",
            LastName = "NotUser",
            Email = "nottestwaitlistuser@hippodigital.co.uk"
        });
    }
    
    [Test]
    public async Task ShouldAddUserToBookingWaitList_WhenRequested()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        
        // Act
        var response = await client.PostAsJsonAsync($"{bookingRoot}", new
        {
            areaId = area.Id,
            date = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day)
        });
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        
        responseBody.Should().NotBeNullOrEmpty();
    }
    
    [Test]
    public async Task ShouldFindUserInBookingWaitList_WhenRequested()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var todaysDate = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "testuser",
                AreaId = area.Id,
                DateToBook = todaysDate,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.GetAsync($"{bookingRoot}/{booking.First().Id}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        responseBody.Should().NotBeNullOrEmpty();
        
        var bookingWaitList = responseBody.FromJson<BookingWaitListResponse>();
        bookingWaitList.Should().NotBeNull();
        bookingWaitList.AreaId.Should().Be(area.Id);
        bookingWaitList.DateToBook.Should().Be(todaysDate);
        
    }
    
    [Test]
    public async Task ShouldStillReturnOk_WhenCallingDelete_IfWaitListBookingDoesNotExist()
    {
        // Arrange
        var client = GetClient();
        
        // Act
        var response = await client.DeleteAsync($"{bookingRoot}/111");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
    
    [Test]
    public async Task ShouldReturnNoContent_WhenRemoveRequestedAndSuccessful()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var todaysDate = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "testuser",
                AreaId = area.Id,
                DateToBook = todaysDate,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.DeleteAsync($"{bookingRoot}/{booking.First().Id}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        
    }
    
    [Test]
    public async Task ShouldReturnUnauthorized_WhenBookingDoesNotBelongToUser()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var todaysDate = new DateOnly(DateTime.Now.Year, DateTime.Now.Month, DateTime.Now.Day);
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "nottestwaitlistuser",
                AreaId = area.Id,
                DateToBook = todaysDate,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.DeleteAsync($"{bookingRoot}/{booking.First().Id}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }
}