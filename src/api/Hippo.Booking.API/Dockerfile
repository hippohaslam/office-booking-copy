FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["api/Hippo.Booking.API/Hippo.Booking.API.csproj", "api/Hippo.Booking.API/"]
COPY ["api/Hippo.Booking.Application/Hippo.Booking.Application.csproj", "api/Hippo.Booking.Application/"]
COPY ["api/Hippo.Booking.Core/Hippo.Booking.Core.csproj", "api/Hippo.Booking.Core/"]
RUN dotnet restore "api/Hippo.Booking.API/Hippo.Booking.API.csproj"
COPY . .
WORKDIR "/src/api/Hippo.Booking.API"
RUN dotnet build "Hippo.Booking.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Hippo.Booking.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Hippo.Booking.API.dll"]
