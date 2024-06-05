using FluentValidation;

namespace Hippo.Booking.Application.Models;

public class UpdateOfficeRequest
{
    public string Name { get; set; } = string.Empty;
    
    public string FloorPlanJson { get; set; } = string.Empty;
    
    public List<BookableObjectDto> BookableObjects { get; set; } = new();
    
}

public class UpdateOfficeRequestValidator : AbstractValidator<UpdateOfficeRequest>
{
    public UpdateOfficeRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}