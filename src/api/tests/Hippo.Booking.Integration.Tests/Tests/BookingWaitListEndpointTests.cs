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
    private const string BookingRoot = "booking/waitlist";
    private const string QueueUser1 = "bookingWaitListQueueUser1";
    private const string QueueUser2 = "bookingWaitListQueueUser2";
    private const string QueueUser3 = "bookingWaitListQueueUser3";
    
    [OneTimeSetUp]
    public async Task BookingWaitListEndpointTestsSetup()
    {
        GetClient();
        // Create all test users
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
        await AddEntity(new User
        {
            Id = QueueUser1,
            FirstName = "Queue",
            LastName = "UserOne",
            Email = "bookingWaitListQueueUser1@hippodigital.co.uk"
        });
        await AddEntity(new User
        {
            Id = QueueUser2,
            FirstName = "Queue",
            LastName = "UserTwo",
            Email = "bookingWaitListQueueUser2@hippodigital.co.uk"
        });
        await AddEntity(new User
        {
            Id = QueueUser3,
            FirstName = "Queue",
            LastName = "UserThree",
            Email = "bookingWaitListQueueUser3@hippodigital.co.uk"
        });
    }
    
    [Test]
    public async Task ShouldAddUserToBookingWaitList_WhenRequested()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(1));
        
        // Act
        var response = await client.PostAsJsonAsync($"{BookingRoot}", new
        {
            areaId = area.Id,
            date = date
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
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(2));
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "testuser",
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.GetAsync($"{BookingRoot}/{booking.First().Id}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        responseBody.Should().NotBeNullOrEmpty();
        
        var bookingWaitList = responseBody.FromJson<BookingWaitListResponse>();
        bookingWaitList.Should().NotBeNull();
        bookingWaitList.Area.Id.Should().Be(area.Id);
        bookingWaitList.Location.Id.Should().Be(location.Id);
        bookingWaitList.DateToBook.Should().Be(date);
        
    }
    
    [Test]
    public async Task ShouldStillReturnOk_WhenCallingDelete_IfWaitListBookingDoesNotExist()
    {
        // Arrange
        var client = GetClient();
        
        // Act
        var response = await client.DeleteAsync($"{BookingRoot}/111");
        
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
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(3));
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "testuser",
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.DeleteAsync($"{BookingRoot}/{booking.First().Id}");
        
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
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(4));
        var booking = await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = "nottestwaitlistuser",
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.ToUniversalTime()
            }
        ]);
        
        // Act
        var response = await client.DeleteAsync($"{BookingRoot}/{booking.First().Id}");
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task ShouldReturnQueueLengthAndNullPosition_WhenUserNotInQueue()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(5));
        
        // Add 3 other users to the queue
        await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = QueueUser1,
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-30).AddDays(5).ToUniversalTime()
            },
            new BookingWaitList
            {
                UserId = QueueUser2,
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-20).AddDays(5).ToUniversalTime()
            },
            new BookingWaitList
            {
                UserId = QueueUser3,
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-10).AddDays(5).ToUniversalTime()
            }
        ]);
        
        // Act
        var dateTime = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
        var response = await client.GetAsync($"{BookingRoot}/area/{area.Id}/{dateTime:yyyy-MM-ddTHH:mm:ssZ}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var waitingListData = responseBody.FromJson<WaitingListAreaResponse>();
        
        waitingListData.Should().NotBeNull();
        waitingListData.QueueLength.Should().Be(3);
        waitingListData.QueuePosition.Should().BeNull();
    }

    [Test]
    public async Task ShouldReturnQueueLengthAndPosition_WhenUserInQueue()
    {
        // Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var date = DateOnly.FromDateTime(DateTime.Today.AddDays(6));
        
        // Add test user and 2 other users to the queue
        await SetUpBookingWaitList([
            new BookingWaitList
            {
                UserId = QueueUser1,
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-30).AddDays(6).ToUniversalTime()
            },
            new BookingWaitList
            {
                UserId = "testuser", // Our test user
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-20).AddDays(6).ToUniversalTime()
            },
            new BookingWaitList
            {
                UserId = QueueUser2,
                AreaId = area.Id,
                DateToBook = date,
                TimeQueued = DateTime.Now.AddMinutes(-10).AddDays(6).ToUniversalTime()
            }
        ]);
        
        // Act
        var dateTime = new DateTime(date.Year, date.Month, date.Day, 0, 0, 0, DateTimeKind.Utc);
        var response = await client.GetAsync($"{BookingRoot}/area/{area.Id}/{dateTime:yyyy-MM-ddTHH:mm:ssZ}");
        
        // Assert
        response.EnsureSuccessStatusCode();
        
        var responseBody = await response.Content.ReadAsStringAsync();
        var waitingListData = responseBody.FromJson<WaitingListAreaResponse>();
        
        waitingListData.Should().NotBeNull();
        waitingListData.QueueLength.Should().Be(3);
        waitingListData.QueuePosition.Should().Be(2); // Second in queue
    }
}