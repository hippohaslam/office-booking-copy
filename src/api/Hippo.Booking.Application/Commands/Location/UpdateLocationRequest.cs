using FluentValidation;
using Hippo.Booking.Application.Models;

namespace Hippo.Booking.Application.Commands.Location;

public class UpdateLocationRequest
{
    public string Name { get; set; } = string.Empty;
    
    public string FloorPlanJson { get; set; } = string.Empty;
    
    public List<BookableObjectDto> BookableObjects { get; set; } = new();
    
}

public class UpdateLocationRequestValidator : AbstractValidator<UpdateLocationRequest>
{
    public UpdateLocationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}