using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.OpenApi.Models;

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
builder.Services.AddSwaggerGen(options =>
{
    var scheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme.",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri("https://accounts.google.com/o/oauth2/v2/auth"),
                TokenUrl = new Uri("https://oauth2.googleapis.com/token")
            }
        }
    };
    
    options.AddSecurityDefinition("OAuth", scheme);
    
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "OAuth"
                }
            },
            Array.Empty<string>()
        }
    });
});

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
new BookingEndpoints().Map(app);

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowLocalhost");
}
app.MapGet("/", () => TypedResults.Redirect("/swagger/index.html"));

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.OAuthScopes("profile", "openid");
    options.OAuthUsePkce();
});

app.Run();