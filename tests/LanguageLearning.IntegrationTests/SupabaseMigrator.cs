using LanguageLearning.Infrastructure.Data;
using LanguageLearning.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LanguageLearning.IntegrationTests;

public class SupabaseMigrator
{
    [Fact]
    public async Task MigrateAndSeedSupabaseDatabase()
    {
        var conn = "Host=localhost;Port=5432;Database=tilshunos_db;Username=postgres;Password=password;";
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(conn)
            .Options;

        using var db = new AppDbContext(options);

        // Generate full DDL script for all entities
        var script = db.Database.GenerateCreateScript();

        var safeScript = script
            .Replace("CREATE TABLE ", "CREATE TABLE IF NOT EXISTS ")
            .Replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ")
            .Replace("CREATE UNIQUE INDEX ", "CREATE UNIQUE INDEX IF NOT EXISTS ");

        await File.WriteAllTextAsync("supabase_schema.sql", safeScript);
    }
}
