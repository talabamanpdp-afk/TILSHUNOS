using System.Text;
using System.Text.Json.Serialization;
using LanguageLearning.Api.Services;
using LanguageLearning.Application.Interfaces;
using LanguageLearning.Infrastructure.Data;
using LanguageLearning.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers with JSON Enums
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Built-in .NET 10 OpenAPI
builder.Services.AddOpenApi();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5432;Database=tilshunos_db;Username=postgres;Password=password;";

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("LanguageLearning.Infrastructure"));
});

// Authentication & JWT
var secretKey = builder.Configuration["Jwt:SecretKey"] ?? "TilshunosSuperSecretSecureMasterKey2026!ForAuthenticationJWT123456";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "Tilshunos";
var audience = builder.Configuration["Jwt:Audience"] ?? "TilshunosLearners";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

builder.Services.AddAuthorization();

// CORS for React / Vite and PWA
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => 
                  string.IsNullOrEmpty(origin) ||
                  origin.StartsWith("http://localhost") || 
                  origin.StartsWith("https://localhost") || 
                  origin.EndsWith(".vercel.app") ||
                  origin.EndsWith(".onrender.com"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Application & Infrastructure Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddSingleton<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddHttpClient<IEmailService, EmailService>();
builder.Services.AddHttpClient<IAiAssistantService, AiAssistantService>();

var app = builder.Build();

// Auto-seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        await DbSeeder.SeedAsync(db, hasher, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// For integration tests
public partial class Program { }
