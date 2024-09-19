INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate") 
VALUES ('SlackConfirmationScheduledTask', '{"message": "Don''t forget, you have a booking tomorrow. Please confirm you still require this booking.", "dayOffset": 1}', '15:00:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have a booking today, please confirm you still require this booking."}', '08:30:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have not confirmed your booking yet. Please confirm now or it may be automatically cancelled."}', '09:00:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have still not confirmed your booking. Please confirm now or it may be automatically cancelled."}', '09:30:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('CancelUnconfirmedBookingsScheduledTask', '{}', '10:00:00', '2024-01-01');