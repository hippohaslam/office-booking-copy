using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Interfaces;
using Microsoft.OpenApi.Models;

const string googleClientId = "287640824547-7jf3a50aklmis16bh1uptkius9nibkga.apps.googleusercontent.com";

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "https://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
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
        Extensions = new Dictionary<string, IOpenApiExtension>
        {
            {"x-tokenName", new OpenApiString("id_token")}
        },
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

builder.Services.AddStartupTask<MigrateDatabaseStartupTask>();

builder.Services.AddHippoBookingApplication();

builder.Services.AddAuthentication("Cookie")
    .AddCookie("Cookie", options =>
    {
        if (builder.Environment.IsDevelopment())
        {
            options.Cookie.SecurePolicy = CookieSecurePolicy.None;
            options.Cookie.SameSite = SameSiteMode.Lax;
        }
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        };
    })
    .AddJwtBearer("Google", options =>
    {
        options.UseGoogle(googleClientId);
    });

builder.Services.AddAuthorization(x => x.FallbackPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .Build());

var app = builder.Build();

new LocationEndpoints().Map(app);
new HealthEndpoints().Map(app);
new BookingEndpoints().Map(app);
new SessionEndpoints().Map(app);

if (app.Environment.IsDevelopment())
{
    new TestEndpoints().Map(app);
    app.UseCors("AllowLocalhost");
}
app.MapGet("/", [AllowAnonymous] () => TypedResults.Redirect("/swagger/index.html"));

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.OAuthClientId(googleClientId);
    options.OAuthScopes("profile", "openid", "email");
    options.OAuthUsePkce();
});

app.UseAuthentication();
app.UseAuthorization();

app.Run();