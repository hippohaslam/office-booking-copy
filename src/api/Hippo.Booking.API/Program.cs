using FluentValidation;
using Hangfire;
using Hippo.Booking.API.Endpoints;
using Hippo.Booking.API.Extensions;
using Hippo.Booking.API.HostedServices;
using Hippo.Booking.API.Mocks;
using Hippo.Booking.API.Services;
using Hippo.Booking.API.StartupTasks;
using Hippo.Booking.Application;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Extensions;
using Hippo.Booking.Core;
using Hippo.Booking.Core.Interfaces;
using Hippo.Booking.Infrastructure.Configuration;
using Hippo.Booking.Infrastructure.EF;
using Hippo.Booking.Infrastructure.Reports;
using Hippo.Booking.Infrastructure.Scheduling;
using Hippo.Booking.Infrastructure.Slack;
using Microsoft.AspNetCore.Authentication;
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
    .ConfigureLogging(
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
        Environment.GetEnvironmentVariable("IsAwsEnvironment") == "true")
        .CreateBootstrapLogger();

try
{
    Log.Logger.Information("Starting application");

    var builder = WebApplication.CreateBuilder(args);

    if (builder.Configuration.GetValue<bool>("IsAwsEnvironment"))
    {
        Log.Logger.Information("Using AWS Secrets Manager and cloudwatch logging");
        var lowerEnvironment = builder.Environment.EnvironmentName.ToLowerInvariant();
        var awsRegion = builder.Configuration.GetValue<string>("AwsRegion") ?? "eu-west-1";
        builder.Configuration.AddAwsSecretsManager(awsRegion, $"booking-api-secrets-{lowerEnvironment}");

        builder.Services.AddSerilog((_, lc) => lc
            .ConfigureLogging(builder.Environment.EnvironmentName, true));
    }
    else
    {
        Log.Logger.Information("Using local secrets and console logging");
        builder.Services.AddSerilog((_, lc) => lc
            .ConfigureLogging(string.Empty, false));
    }

    Log.Logger.Information("Environment: {0}", builder.Environment.EnvironmentName);
    
    builder.Services.AddHealthChecks();

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
    
    var dbConnectionString = builder.Configuration.GetConnectionString("HippoBookingDbContext");

    builder.Services.AddDbContext<HippoBookingDbContext>(
        optionsBuilder =>
        {
            optionsBuilder.UseNpgsql(dbConnectionString);

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

    builder.Services.AddScoped<IReportRunner, PostgresReportRunner>();

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
    builder.Services.AddStartupTask<HangfireStartupTask>();

    builder.Services.AddHippoBookingApplication();

    if (builder.Configuration.GetValue<bool>("UseMockAuth"))
    {
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "Test";
            options.DefaultChallengeScheme = "Test";
        }).AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
    }
    else
    {
        builder.Services.AddAuthentication("Cookie")
            .AddCookie("Cookie", options =>
            {
                options.Cookie.SameSite = SameSiteMode.Strict;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.ExpireTimeSpan = TimeSpan.FromHours(3);
                options.SlidingExpiration = true;

                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            })
            .AddJwtBearer("Google",
                options => { options.UseGoogle(builder.Configuration.GetValue<string>("Google:ClientId") ?? ""); });
    }

    builder.Services.AddAuthorization();
    
    builder.Services.AddScheduledTask<SlackConfirmationScheduledTask>();
    builder.Services.AddScheduledTask<CancelUnconfirmedBookingsScheduledTask>();
    builder.Services.AddTransient<ICancelTimedOutBookingWaitingLists, CancelTimedOutBookingWaitingLists>();

    builder.Services.AddSingleton<SchedulingService>();
    builder.Services.AddHostedService<SchedulingWorkerService>();

    builder.Services.AddHttpContextAccessor();
    
    // Setup Hangfire
    var hangfireConnectionString = builder.Configuration.GetConnectionString("HangfireDbContext");
    if (string.IsNullOrWhiteSpace(hangfireConnectionString))
    {
        throw new InvalidOperationException("Hangfire connection string not found");
    }
    builder.Services.AddCustomHangfire(hangfireConnectionString);

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.UseHangfireDashboard();
    }

    new LocationEndpoints().Map(app);
    new AdminLocationEndpoints().Map(app);
    new AdminBookingsEndpoints().Map(app);
    new BookingEndpoints().Map(app);
    new BookingWaitListEndpoints().Map(app);
    new SessionEndpoints().Map(app);
    new UserManagementEndpoints().Map(app);
    new ReportingEndpoints().Map(app);
    new ScreenEndpoints().Map(app);

    if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("IntegrationTest"))
    {
        new TestEndpoints().Map(app);
    }

    app.UseCors(policyBuilder =>
    {
        var origins = app.Configuration.GetValue<string>("AllowedOrigins")?.Split(",") ?? [];
        policyBuilder
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });

    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms (User: {User})";

        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            var name = httpContext.User.Identity?.IsAuthenticated == true ? httpContext.GetUserName() : "anonymous";

            diagnosticContext.Set("User", name);
        };
    });

    app.MapHealthChecks("/health");

    if (app.Environment.IsDevelopment())
    {
        app.MapGet("/", [AllowAnonymous]() => TypedResults.Redirect("/swagger/index.html"))
            .ExcludeFromDescription();

        app.UseSwagger();
        app.UseSwaggerUI(options =>
        {
            options.OAuthClientId(app.Configuration.GetValue<string>("Google:ClientId"));
            options.OAuthClientSecret(app.Configuration.GetValue<string>("Google:ClientSecret"));
            options.OAuthScopes("profile", "openid", "email");
            options.OAuthUsePkce();
        });
    }

    if (!app.Configuration.GetValue<bool>("UseMockAuth"))
    {
        app.Use(async (context, next) =>
        {
            context.Response.Headers.Append("X-Frame-Options", "DENY");
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("X-Xss-Protection", "1; mode=block");
            context.Response.Headers.Append("Referrer-Policy", "no-referrer");
            context.Response.Headers.Append("Content-Security-Policy", "default-src 'self'; frame-ancestors 'none';");
            await next();
        });

        app.UseHsts();
    }

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