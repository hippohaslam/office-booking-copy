using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddValidatorsFromAssemblyContaining(typeof(IMediator));

builder.Services.AddDbContext<HippoBookingDbContext>(
    optionsBuilder =>
    {
        optionsBuilder.UseSqlServer(builder.Configuration.GetConnectionString("HippoBookingDbContext"));

        if (builder.Environment.IsDevelopment())
        {
            optionsBuilder.ConfigureWarnings(x => x.Throw(RelationalEventId.MultipleCollectionIncludeWarning));
        }
    });

builder.Services.AddScoped<IDataContext, HippoBookingDbContext>();

builder.Services.AddHostedService<StartupTaskExecutor>();

builder.Services.AddStartupTask<EnsureCreatedStartupTask>();

builder.Services.AddHippoBookingApplication();

var app = builder.Build();

new OfficeEndpoints().Map(app);
new HealthEndpoints().Map(app);

app.MapGet("/", () => TypedResults.Redirect("/swagger/index.html"));

app.UseSwagger();
app.UseSwaggerUI();

app.Run();