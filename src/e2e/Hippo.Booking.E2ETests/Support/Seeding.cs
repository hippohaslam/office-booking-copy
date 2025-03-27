using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Infrastructure.EF;

namespace Hippo.Booking.E2ETests.Support;

public class Seeding(HippoBookingDbContext db)
{
    public async Task SeedOfficeData()
    {
        var dataDirectory = AppDomain.CurrentDomain.BaseDirectory + "/Data";

        var location = new Location
        {
            Name = "Leeds - e2e test",
            Description = "Test Leeds location",
            Areas = new List<Area>
            {
                new()
                {
                    Name = "Floor 1",
                    Description = "Main office floor",
                    FloorPlanJson = await File.ReadAllTextAsync(dataDirectory + "/leeds-floorplan.json"),
                    AreaTypeId = AreaTypeEnum.Desks,
                    BookableObjects = new List<BookableObject>
                    {
                        new()
                        {
                            Name = "Desk 1",
                            Description = "Single monitor",
                            FloorplanObjectId = "6c8306f1-1852-44d1-adf9-88d2bc7dae66",
                            BookableObjectTypeId = (BookableObjectTypeEnum) 1
                        },
                        new()
                        {
                            Name = "Desk 2",
                            Description = "Single monitor",
                            FloorplanObjectId = "fef83bd5-6b77-4a78-bdfe-a5c3a5fbaa64",
                            BookableObjectTypeId = (BookableObjectTypeEnum) 1
                        },
                        new()
                        {
                            Name = "Desk 3",
                            Description = "Dual monitor",
                            FloorplanObjectId = "e663ebe2-2cc2-41a5-b180-15be0c4066c1",
                            BookableObjectTypeId = (BookableObjectTypeEnum) 1
                        },
                        new()
                        {
                            Name = "Desk 4",
                            Description = "Dual monitor",
                            FloorplanObjectId = "4886005e-bda3-410b-942d-3f810d1f8159",
                            BookableObjectTypeId = (BookableObjectTypeEnum) 1
                        },
                        new()
                        {
                            Name = "Desk 5",
                            Description = "Dual monitor",
                            FloorplanObjectId = "128e8ee6-69f3-4c61-8c79-aede16d3e08a",
                            BookableObjectTypeId = (BookableObjectTypeEnum) 1
                        }
                    }
                },
                new()
                {
                    Name = "Whitehall Parking",
                    Description = "Main car park",
                    FloorPlanJson = string.Empty,
                    LocationId = 1,
                    AreaTypeId = AreaTypeEnum.CarPark
                }
            },
            Address = "Aireside House, 26 Aire St, Leeds, LS1 4HT",
            SlackChannel = "https://hippodigital.co.uk/",
            GuideLink = "https://hippodigital.co.uk/"
        };
        
        var existingLocation = db.Locations.FirstOrDefault(l => l.Name == location.Name);
        if (existingLocation == null)
        {
            db.Locations.Add(location);
            await db.Save();
        }
    }

    public async Task SetUserAsAdmin()
    {
        var user = db.Users.FirstOrDefault(u => u.Email == Config.UserEmail);

        if (user != null)
        {
            user.IsAdmin = true;
            db.Users.Update(user);
        }
        else
        {
            user = new User
            {
                // Id = Config.UserId, <-- If google auth is re-enabled, this will need to be set
                Id = "testuser",
                FirstName = "Test",
                LastName = "User",
                Email = Config.UserEmail,
                IsAdmin = true
            };
            db.Users.Add(user);
        }
        
        await db.Save();
    }
}