# Backend API Project

The API is a standard .NET 8 ASP Net Core application It uses minimal APIs to expose endpoints to the web API,
and uses a Postgres SQL database accessed via EF Core.

## Setup

You must have already followed "Getting Started" in the main README.MD and have Docker running with a postgres instance.

Use your IDE of choice (Rider, Visual Studio, VS Code) and ensure .NET 8 SDK is installed.
You should be able to build and run all tests under the `api/tests` directory.

## Project Structure

The project is structured as follows:

- Hippo.Booking.API: The Asp Net Core project that contains all endpoints and web specific code
- Hippo.Booking.Application: The application layer that contains all business logic. This layer should not have any external dependencies
- Hippo.Booking.Core: The core layer that contains all domain models and core interfaces
- Hippo.Booking.Infrastructure: The infrastructure layer that contains all external dependencies such as databases, email, slack etc
- Hippo.Booking.Infrastructure.EF: The EF Core implementation of the infrastructure layer

## Known Issues

### Windows

#### Error net::ERR_CERT_INVALID when accessing <https://localhost:7249/>

In an admin console run;

- dotnet dev-certs https --clean
- dotnet dev-certs https --trust

Then restart chrome & API .net app, and see if it has been fixed. If not;

- Open the run dialog and run certmgr.msc
- Go to Peronal > Certificates
- localhost with Friendly Name "ASP.NET Core HTTPS development certificate" > right click > all tasks > export
- Yes to private key, keep the rest as default, add a simple password
- Go to Trusted Root Certification Authority > Certificates > Right Click > All Tasks > Import
- Import the Certificate!
- Restart chrome & API .net app

This should fix the issue forever more, even if you were to remove the certs and add them again, it will remain fixed
