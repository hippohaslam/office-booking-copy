using Hippo.Booking.Core.Enums;

namespace Hippo.Booking.Core.Models;

public class ReportingParameterDefinition
{
    public string Id { get; set; } = string.Empty;
    
    public string Name { get; set; } = string.Empty;
    
    public FieldTypeEnum FieldType { get; set; }
}