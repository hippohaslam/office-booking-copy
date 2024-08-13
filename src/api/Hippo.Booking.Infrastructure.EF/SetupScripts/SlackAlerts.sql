INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun") 
VALUES ('SlackConfirmationScheduledTask', '{"message": "Don''t forget, you have a booking tomorrow. Please confirm you still require this booking.", "dayOffset": -1}', '15:00:00');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun") 
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have a booking today, please confirm you still require this booking."}', '08:00:00');

INSERT INTO public."ScheduledTasks"("Task", "PayloadJson", "TimeToRun") 
VALUES ('SlackConfirmationScheduledTask', '{"message": "You have not confirmed your booking yet. Please confirm now or it may be automatically cancelled."}', '08:30:00');