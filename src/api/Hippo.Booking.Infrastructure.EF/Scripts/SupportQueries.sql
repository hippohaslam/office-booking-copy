-- Get all bookings for today
SELECT u."Email", l."Name" "LocationName", a."Name" AreaName, bo."Name" "ObjectName", b."IsConfirmed", b."DeletedAt"
FROM "Bookings" b
         INNER JOIN "Users" u ON b."UserId" = u."Id"
         INNER JOIN "BookableObjects" bo ON b."BookableObjectId" = bo."Id"
         INNER JOIN "Areas" a ON bo."AreaId" = a."Id"
         INNER JOIN "Locations" l ON a."LocationId" = l."Id"
WHERE "Date" = current_date

