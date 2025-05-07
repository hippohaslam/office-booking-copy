using System.Diagnostics.CodeAnalysis;
using System.Text;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Calendar.v3;
using Google.Apis.Calendar.v3.Data;
using Google.Apis.Services;
using Hippo.Booking.Core.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Hippo.Booking.Infrastructure.Google;

[ExcludeFromCodeCoverage(Justification = "Can't test as it relies on Google API")]
public class GoogleBookingCalendar(
    IOptions<GoogleServiceAccountOptions> calendarOptions,
    ILogger<GoogleBookingCalendar> logger) : IBookingCalendar
{
    private readonly GoogleServiceAccountOptions _googleServiceAccountOptions = calendarOptions.Value;

    public async Task<string> CreateBookingEvent(string email, string summary, DateOnly date, CancellationToken ct = default)
    {
        var creds = GoogleCredential
            .FromJson(_googleServiceAccountOptions.Credentials)
            .CreateScoped(CalendarService.Scope.Calendar)
            .CreateWithUser(email);
        
        var calendarService = new CalendarService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = creds,
            ApplicationName = "Hippo Booking"
        });
        
        var calendarRequest = calendarService.Calendars.Get(email);
        var calendar = await calendarRequest.ExecuteAsync(ct);
        
        var summaryStringBuilder = new StringBuilder();
        
        if (!string.IsNullOrEmpty(_googleServiceAccountOptions.Prefix))
        {
            summaryStringBuilder.Append(_googleServiceAccountOptions.Prefix);
            summaryStringBuilder.Append(" - ");
        }
        
        summaryStringBuilder.Append(summary);
        
        var eventResponse = await calendarService.Events.Insert(new Event
        {
            Summary = summaryStringBuilder.ToString(),
            Description = "Created by Hippo Reserve",
            Transparency = "transparent", // shows as free in calendar
            Start =  new EventDateTime
            {
                Date = date.ToString("yyyy-MM-dd"),
            },
            End = new EventDateTime
            {
                Date = date.ToString("yyyy-MM-dd"),
            },
            Reminders = new Event.RemindersData
            {
                UseDefault = false,
                Overrides = new List<EventReminder>()
            }
        }, calendar.Id)
            .ExecuteAsync(ct);

        logger.LogInformation("Created calendar event {EventId} for booking {Email} on {Date}", 
            eventResponse.Id, 
            email,
            date);
        
        return eventResponse.Id;
    }

    public async Task DeleteBookingEvent(string email, string eventId, CancellationToken ct = default)
    {
        var creds = GoogleCredential
            .FromJson(_googleServiceAccountOptions.Credentials)
            .CreateScoped(CalendarService.Scope.Calendar)
            .CreateWithUser(email);
        
        var calendarService = new CalendarService(new BaseClientService.Initializer()
        {
            HttpClientInitializer = creds,
            ApplicationName = "Hippo Booking"
        });
        
        var calendarRequest = calendarService.Calendars.Get(email);
        var calendar = await calendarRequest.ExecuteAsync(ct);
        
        if (string.IsNullOrEmpty(eventId))
        {
            return;
        }
        
        await calendarService.Events.Delete(calendar.Id, eventId)
            .ExecuteAsync(ct);
        
        logger.LogInformation("Deleted calendar event {EventId} for {Email}", eventId, email);
    }
}