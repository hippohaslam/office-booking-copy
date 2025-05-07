using FluentValidation;
using Hangfire;
using Hippo.Booking.Application.Consumers;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Application.Queries.Bookings;
using Hippo.Booking.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Hippo.Booking.Application.Commands.Bookings;

public class BookingCommands(
    IDataContext dataContext,
    IUserNotifier userNotifier,
    IUserProvider userProvider,
    IBookingQueries bookingQueries,
    IDateTimeProvider dateTimeProvider,
    IBookingCalendar bookingCalendar,
    IValidator<CreateBookingRequest> createBookingValidator,
    IValidator<DeleteBookingRequest> deleteBookingValidator,
    IBackgroundJobClient backgroundJobClient,
    ILogger<BookingCommands> logger) : ICreateBookingCommand, IDeleteBookingCommand
{
    public async Task<BookingResponse> Handle(CreateBookingRequest request)
    {
        await createBookingValidator.ValidateAndThrowAsync(request);

        var bookableObject = await dataContext.Query<Core.Entities.BookableObject>()
            .Include(i => i.Area)
            .ThenInclude(i => i.Location)
            .SingleOrDefaultAsync(x => x.Id == request.BookableObjectId
                           && x.AreaId == request.AreaId);

        if (bookableObject == null)
        {
            throw new ClientException($"Bookable object id {request.BookableObjectId} not found.");
        }

        if (await dataContext.Query<Core.Entities.Booking>(x => x.WithNoTracking())
                .Include(i => i.BookableObject)
                .AnyAsync(x =>
                    x.BookableObject.AreaId == request.AreaId &&
                    x.Date == request.Date &&
                    x.BookableObjectId == request.BookableObjectId))
        {
            throw new ClientException("Booking already exists");
        }

        var booking = new Core.Entities.Booking
        {
            BookableObjectId = request.BookableObjectId,
            Date = request.Date,
            UserId = request.UserId,
            IsConfirmed = dateTimeProvider.Today >= request.Date
        };

        try
        {
            var summary =
                $"{bookableObject.Name} - {bookableObject.Area.Name} - {bookableObject.Area.Location.Name}";

            var calendarEventId = await bookingCalendar.CreateBookingEvent(request.UserEmail, summary, request.Date);
            booking.CalendarEventId = calendarEventId;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating booking event");
        }

        dataContext.AddEntity(booking);

        await dataContext.Save();
        
        var bookingToReturn = await bookingQueries.GetBookingById(booking.Id);
        
        // date string to UK format
        var dateString = request.Date.ToString("dddd d MMMM yyyy");
        
        await userNotifier.NotifyUser(request.UserId,
            $"Your new booking for *{bookingToReturn!.BookableObject.Name}* at *{bookingToReturn.Location.Name}* on *{dateString}* has been created");

        return bookingToReturn;
    }

    public async Task Handle(DeleteBookingRequest request)
    {
        await deleteBookingValidator.ValidateAndThrowAsync(request);

        var booking = await dataContext.Query<Core.Entities.Booking>()
            .Include(i => i.BookableObject)
            .SingleOrDefaultAsync(x => x.Id == request.BookingId);

        if (booking != null)
        {
            var currentUser = userProvider.GetCurrentUser();

            if (currentUser == null)
            {
                throw new ClientForbiddenException();
            }

            var currentUserId = currentUser.UserId;
            
            if (currentUserId != booking.UserId && !currentUser.IsAdmin)
            {
                throw new ClientForbiddenException();
            }

            dataContext.DeleteEntity(booking);
            await dataContext.Save();

            if (booking.CalendarEventId != null)
            {
                try
                {
                    await bookingCalendar.DeleteBookingEvent(currentUser.Email, booking.CalendarEventId);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error deleting booking event: " + booking.CalendarEventId);
                }
            }

            var forSomeBodyElse = currentUserId != booking.UserId ? $" by {currentUser.FullName}" : string.Empty;

            var dateString = booking.Date.ToString("dddd d MMMM yyyy");
            
            await userNotifier.NotifyUser(booking.UserId,
                $"Your booking for *{booking.BookableObject.Name}* on *{dateString}* has been cancelled.{forSomeBodyElse}");

            backgroundJobClient.Enqueue<BookingConsumer>(
                x => x.HandleAsync(new BookFromWaitListRequest
            {
                BookableObjectId = booking.BookableObjectId,
                AreaId = booking.BookableObject.AreaId,
                Date = booking.Date
            }));
        }
    }
}