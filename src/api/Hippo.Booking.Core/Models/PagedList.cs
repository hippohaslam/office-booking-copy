namespace Hippo.Booking.Core.Models;

public class PagedList<T>
{
    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

    public List<T> Items { get; set; } = new();
}