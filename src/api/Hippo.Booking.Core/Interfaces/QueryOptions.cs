namespace Hippo.Booking.Core.Interfaces;

public class QueryOptions
{
    public bool NoTracking { get; private set; }

    public bool SplitQuery { get; private set; }
    

    public QueryOptions WithNoTracking()
    {
        NoTracking = true;
        return this;
    }

    public QueryOptions WithSplitQuery(bool split = true)
    {
        SplitQuery = split;
        return this;
    }
}