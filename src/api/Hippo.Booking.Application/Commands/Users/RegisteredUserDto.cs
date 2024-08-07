using FluentValidation;

namespace Hippo.Booking.Application.Commands.Users;

public class RegisteredUserDto
{
    public string UserId { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName => FirstName + " " + LastName;
}

public class RegisteredUserDtoValidator : AbstractValidator<RegisteredUserDto>
{
    public RegisteredUserDtoValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Email).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
    }
}