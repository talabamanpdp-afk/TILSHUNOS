# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY src/LanguageLearning.Domain/*.csproj src/LanguageLearning.Domain/
COPY src/LanguageLearning.Application/*.csproj src/LanguageLearning.Application/
COPY src/LanguageLearning.Infrastructure/*.csproj src/LanguageLearning.Infrastructure/
COPY src/LanguageLearning.Api/*.csproj src/LanguageLearning.Api/
COPY LanguageLearning.slnx ./

RUN dotnet restore src/LanguageLearning.Api/LanguageLearning.Api.csproj

# Copy all source files and publish release
COPY src/ src/
RUN dotnet publish src/LanguageLearning.Api/LanguageLearning.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render exposes PORT dynamically, ASP.NET Core respects ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "LanguageLearning.Api.dll"]
