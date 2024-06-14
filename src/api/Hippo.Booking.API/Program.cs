using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddValidatorsFromAssemblyContaining(typeof(ClientException));

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

new LocationEndpoints().Map(app);
new HealthEndpoints().Map(app);

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowLocalhost");
}
app.MapGet("/", () => TypedResults.Redirect("/swagger/index.html"));

app.UseSwagger();
app.UseSwaggerUI();

app.Run();