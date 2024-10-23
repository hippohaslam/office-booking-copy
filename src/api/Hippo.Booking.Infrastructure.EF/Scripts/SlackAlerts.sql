INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate") 
VALUES ('SlackConfirmationScheduledTask', '{"message": "Don''t forget, you have a booking next week. Please confirm you still require this booking.", "dayOffset": 7, "canConfirm": false}', '15:00:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have a booking today, please confirm you still require this booking.", "canConfirm": true}', '08:00:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have not confirmed your booking yet. Please confirm now or it may be automatically cancelled.", "canConfirm": true}', '08:30:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have still not confirmed your booking. Please confirm now or it may be automatically cancelled.", "canConfirm": true}', '09:30:00', '2024-01-01');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun", "LastRunDate")
VALUES ('CancelUnconfirmedBookingsScheduledTask', '{}', '09:15:00', '2024-01-01');