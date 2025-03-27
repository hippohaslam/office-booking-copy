using FluentAssertions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Tests.Utility;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Integration.Tests.Tests;

[TestFixture]
public class BookingWaitListConsumerTests : IntegrationTestBase
{
    private const string TestUserOneId = "bookingWaitListConsumertestuser1";
    private const string TestUserTwoId = "bookingWaitListConsumertestuser2";
    private const string TestUserThreeId = "bookingWaitListConsumertestuser3";
    
    [OneTimeSetUp]
    public async Task BookingWaitListConsumerTestsSetup()
    {
        GetClient();
        await AddEntity(new User
        {
            Id = TestUserOneId,
            FirstName = "Test",
            LastName = "User",
            Email = "testuser@hippodigital.co.uk"
        });
        await AddEntity(new User
        {
            Id = TestUserTwoId,
            FirstName = "Test 2",
            LastName = "User 2",
            Email = "testuser2@hippodigital.co.uk"
        });
        await AddEntity(new User
        {
            Id = TestUserThreeId,
            FirstName = "Test 3",
            LastName = "User 3",
            Email = "testuser3@hippodigital.co.uk"
        });
    }
    
    [Test]
    public async Task ShouldBookUserThreeWhoIsNextOnList_WhenABookingIsDeleted()
    {
        //Arrange
        var client = GetClient();
        var location = await SetUpLocation();
        var area = await SetUpArea(location);
        var bookingDate = DateOnly.FromDateTime(DateTime.Now);
        await SetUpBookingWaitList(
        [
            new BookingWaitList() { Id = 998, UserId = TestUserTwoId, AreaId = area.Id, DateToBook = bookingDate, TimeQueued = DateTime.Now.ToUniversalTime()},
            new BookingWaitList()
            {
                Id = 999, 
                UserId = TestUserThreeId, 
                AreaId = area.Id,
                DateToBook = bookingDate,
                TimeQueued = DateTime.Now.ToUniversalTime().AddDays(-1)
            }
        ]);
        var bookableObject = await SetUpBookableObject(area, "Booking Test Desk 1");
        var booking = await SetUpBooking(TestUserOneId, bookableObject, bookingDate);

        //Act
        var response =
            await client.DeleteAsync(
                $"/booking/{booking.Id}");

        //Assert
        response.EnsureSuccessStatusCode();
        
        var result = await RetryUtility.WaitForAsync(() =>
        {
            var userThreeHasBooking = DbContext.Bookings.AsNoTracking().Any(x => x.UserId == TestUserThreeId && x.Date == bookingDate);
            var userThreeRemovedFromWaitList = !DbContext.BookingWaitLists.AsNoTracking().Any(x => x.UserId == TestUserThreeId && x.DateToBook == bookingDate);

            EnsureEntitiesAreDetached();

            return userThreeHasBooking && userThreeRemovedFromWaitList;
        });
        
        result.Should().BeTrue("The wrong user was removed from the waitlist, suggesting incorrect user was booked");
    }
    
    private void EnsureEntitiesAreDetached()
    {
        var trackedEntities = DbContext.ChangeTracker.Entries().ToList();
        foreach (var entity in trackedEntities)
        {
            DbContext.Entry(entity.Entity).State = EntityState.Detached;
        }
    }
}