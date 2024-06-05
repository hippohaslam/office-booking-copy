namespace Hippo.Booking.Application.Queries.Offices;

public class OfficeQueryResponse
{
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    public string FloorPlanJson { get; set; } = string.Empty;

    public List<BookableObject> BookableObjects { get; set; } = new();

    public class BookableObject
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string FloorPlanObjectId { get; set; } = string.Empty;
    }
}