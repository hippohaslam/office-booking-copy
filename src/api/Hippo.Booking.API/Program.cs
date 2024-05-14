using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.Application;
using Hippo.Booking.Application.Commands;
using Hippo.Booking.Application.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IMediator, Mediator>();

builder.Services.AddScoped<IHandler<CreateSiteRequest>, SiteCommands>();

builder.Services.AddValidatorsFromAssemblyContaining(typeof(IMediator));

var app = builder.Build();

new SiteEndpoints().Map(app);
new HealthEndpoints().Map(app);

// app.MapGet("/", () => "Hello World!");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();