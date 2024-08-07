using FluentValidation;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.Extensions;
using Hippo.Booking.API.HostedServices;
using Hippo.Booking.API.Services;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.EF;
using Hippo.Booking.Infrastructure.Scheduling;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Interfaces;
using Microsoft.OpenApi.Models;
using Serilog;
using SlackNet.AspNetCore;
using SlackNet.Blocks;

Log.Logger = new LoggerConfiguration()
    .ConfigureLogging(Environment.GetEnvironmentVariable("Aws__AccessKeyId"),
            Environment.GetEnvironmentVariable("Aws__AccessSecretKey"))
        .CreateBootstrapLogger();

try
{
    Log.Logger.Information("Starting application");

    var builder = WebApplication.CreateBuilder(args);

    Log.Logger.Information("Environment: {0}", builder.Environment.EnvironmentName);

    builder.Services.AddSerilog((services, lc) => lc
        .ConfigureLogging(
            builder.Configuration.GetValue<string>("Aws:AccessKeyId"),
            builder.Configuration.GetValue<string>("Aws:AccessSecretKey")));

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
                { "x-tokenName", new OpenApiString("id_token") }
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
            optionsBuilder.UseNpgsql(builder.Configuration.GetConnectionString("HippoBookingDbContext"));

            if (builder.Environment.IsDevelopment())
            {
                optionsBuilder.ConfigureWarnings(x => x.Throw(RelationalEventId.MultipleCollectionIncludeWarning));
            }
        });

    var slackSettings = builder.Configuration.GetSection("Slack").Get<SlackSettings>() ?? new SlackSettings();

    builder.Services.AddSlackNet(c => c
        .UseApiToken(slackSettings.Token)
        .UseSigningSecret(slackSettings.SigningSecret)
        .RegisterBlockActionHandler<ButtonAction, InteractionEvent>()
    );

    builder.Services.AddCors();

    builder.Services.AddOptions<SlackSettings>().BindConfiguration("Slack");
    builder.Services.AddSingleton<ISlackClient, SlackClient>();

    builder.Services.AddSingleton<IDateTimeProvider, SystemDateTimeProvider>();
    builder.Services.AddScoped<IDataContext, HippoBookingDbContext>();
    
    var slackToken = builder.Configuration.GetValue<string>("Slack:Token");
    if (string.IsNullOrWhiteSpace(slackToken))
    {
        Log.Logger.Warning("Slack token not found, Registering null user notifier");
        builder.Services.AddScoped<IUserNotifier, NullUserNotifier>();
    }
    else
    {
        builder.Services.AddScoped<IUserNotifier, SlackUserNotifier>();
    }
    
    builder.Services.AddScoped<IUserProvider, HttpUserProvider>();

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
        .AddJwtBearer("Google", options => { options.UseGoogle(builder.Configuration.GetValue<string>("Google:ClientId") ?? ""); });

    builder.Services.AddAuthorization();

    builder.Services.AddScoped<IExclusiveLockProvider, NullExclusiveLockProvider>();
    
    builder.Services.AddScheduledTask<SlackConfirmationScheduledTask>();

    builder.Services.AddHostedService<SchedulingWorkerService>();

    builder.Services.AddHttpContextAccessor();

    var app = builder.Build();

    new LocationEndpoints().Map(app);
    new HealthEndpoints().Map(app);
    new BookingEndpoints().Map(app);
    new SessionEndpoints().Map(app);

    if (app.Environment.IsDevelopment())
    {
        new TestEndpoints().Map(app);
    }

    if (!app.Environment.IsEnvironment("IntegrationTest"))
    {
        app.UseCors(policyBuilder =>
        {
            var origins = app.Configuration.GetValue<string>("AllowedOrigins")?.Split(",") ?? [];
            policyBuilder
                .WithOrigins(origins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    }

    app.MapGet("/", [AllowAnonymous] () => TypedResults.Redirect("/swagger/index.html"));

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms (User: {User})";

        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            var name = httpContext.User.Identity?.IsAuthenticated == true ? httpContext.GetUserName() : "anonymous";

            diagnosticContext.Set("User", name);
        };
    });

    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.OAuthClientId(app.Configuration.GetValue<string>("Google:ClientId"));
        options.OAuthClientSecret(app.Configuration.GetValue<string>("Google:ClientSecret"));
        options.OAuthScopes("profile", "openid", "email");
        options.OAuthUsePkce();
    });

    app.UseAuthentication();
    app.UseAuthorization();

    app.UseSlackNet();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }