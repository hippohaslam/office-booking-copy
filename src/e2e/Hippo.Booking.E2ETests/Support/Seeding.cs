using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.E2ETests.Support;

public class Seeding
{
    public async Task SeedOfficeData()
    {
        var db = Config.GetDbContext();
        var dataDirectory = AppDomain.CurrentDomain.BaseDirectory + "/Data";

        var location = new Location
        {
            Id = 1,
            Name = "Leeds",
            Description = "Test Leeds location",
            Areas = new List<Area>()
        };

        var areas = new List<Area>
        {
            new()
            {
                Id = 1,
                Name = "Floor 1",
                Description = "Main office floor",
                FloorPlanJson = await File.ReadAllTextAsync(dataDirectory + "/leeds-floorplan.json"),
                LocationId = 1,
                AreaTypeId = AreaTypeEnum.Desks,
            },
            new()
            {
                Id = 2,
                Name = "Whitehall Parking",
                Description = "Main car park",
                FloorPlanJson = string.Empty,
                LocationId = 1,
                AreaTypeId = AreaTypeEnum.CarPark,
            }
        };

        var bookableObjects = new List<BookableObject>
        {
            new()
            {
                Id = 1,
                Name = "Desk 1",
                Description = "Single monitor",
                FloorplanObjectId = "6c8306f1-1852-44d1-adf9-88d2bc7dae66",
                BookableObjectTypeId = (BookableObjectTypeEnum) 1,
                AreaId = 1
            },
            new()
            {
                Id = 2,
                Name = "Desk 2",
                Description = "Single monitor",
                FloorplanObjectId = "fef83bd5-6b77-4a78-bdfe-a5c3a5fbaa64",
                BookableObjectTypeId = (BookableObjectTypeEnum) 1,
                AreaId = 1
            },
            new()
            {
                Id = 3,
                Name = "Desk 3",
                Description = "Dual monitor",
                FloorplanObjectId = "e663ebe2-2cc2-41a5-b180-15be0c4066c1",
                BookableObjectTypeId = (BookableObjectTypeEnum) 1,
                AreaId = 1
            },
            new()
            {
                Id = 4,
                Name = "Desk 4",
                Description = "Dual monitor",
                FloorplanObjectId = "4886005e-bda3-410b-942d-3f810d1f8159",
                BookableObjectTypeId = (BookableObjectTypeEnum) 1,
                AreaId = 1
            },
            new()
            {
                Id = 5,
                Name = "Desk 5",
                Description = "Dual monitor",
                FloorplanObjectId = "128e8ee6-69f3-4c61-8c79-aede16d3e08a",
                BookableObjectTypeId = (BookableObjectTypeEnum) 1,
                AreaId = 1
            }
        };
        
        var existingLocation = db.Locations.FirstOrDefault(l => l.Id == location.Id);
        if (existingLocation != null)
        {
            db.Entry(existingLocation).CurrentValues.SetValues(location);
        }
        else
        {
            db.Locations.Add(location);
        }

        foreach (var area in areas)
        {
            var existingArea = db.Areas.FirstOrDefault(a => a.Id == area.Id);
            if (existingArea != null)
            {
                db.Entry(existingArea).CurrentValues.SetValues(area);
            }
            else
            {
                db.Areas.Add(area);
            }
        }

        foreach (var bookableObject in bookableObjects)
        {
            var existingBookableObject = db.BookableObjects.FirstOrDefault(b => b.Id == bookableObject.Id);
            if (existingBookableObject != null)
            {
                db.Entry(existingBookableObject).CurrentValues.SetValues(bookableObject);
            }
            else
            {
                db.BookableObjects.Add(bookableObject);
            }
        }

        await db.SaveChangesAsync();
    }
}