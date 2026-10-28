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

    [Fact]
    public async Task VerifyAndSyncSupabaseCms()
    {
        var connStr = "Host=aws-0-ap-northeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.yipexommqztxnvpckqyi;Password=s0x1bj0n$02$;SSL Mode=Require;Trust Server Certificate=true;Timeout=60;";
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connStr)
            .Options;

        using var db = new AppDbContext(options);

        // 1. Ensure table and columns exist in Supabase
        await db.Database.ExecuteSqlRawAsync(
            "CREATE TABLE IF NOT EXISTS system_settings (key character varying(128) PRIMARY KEY, value_json text NOT NULL, updated_at_utc timestamp with time zone NOT NULL);"
        );
        await db.Database.ExecuteSqlRawAsync(
            "CREATE TABLE IF NOT EXISTS uploaded_media (id character varying(64) PRIMARY KEY, file_name character varying(255) NOT NULL, content_type character varying(64) NOT NULL, data_base64 text NOT NULL, created_at_utc timestamp with time zone NOT NULL);"
        );

        // 2. Test saving CMS directly into Supabase
        var conn = db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
        {
            await conn.OpenAsync();
        }

        var sampleJson = System.Text.Json.JsonSerializer.Serialize(new
        {
            hero = "Yangi til. Yangi imkoniyatlar.",
            heroBadge = "TILSHUNOS 2.0 · ILG‘OR TIL O‘RGANISH EKOTIZIMI",
            heroImage = "/hero-tutor.jpg",
            heroMobileImage = "/hero-tutor.jpg",
            description = "TILSHUNOS bilan har kuni tizimli o‘rganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga chiqing.",
            cta = "Bepul boshlash",
            secondaryCta = "Platformani o‘rganish",
            header = "Imkoniyatlar, Biz haqimizda, Kirish",
            about = "TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.",
            aboutDetailed = "TILSHUNOS — xalqaro CEFR (A1–C2) standartlariga moslashtirilgan, sun’iy intellekt va professional ustozlar metodikasini o‘zida mujassam etgan zamonaviy ta’lim platformasi. Bizning asosiy maqsadimiz — har bir foydalanuvchiga murakkab grammatik qoidalarsiz, interaktiv so‘z o‘yinlari, amaliy audio-dialoglar, yozma tahlil va real muloqot orqali tilni tabiiy o‘zlashtirish imkoniyatini taqdim etishdir.",
            aboutButton = "Batafsil ma’lumot",
            team = new[]
            {
                new { name = "Soxibjon Gaybullayev", role = "Asoschi & Bosh Muhandis", bio = "Til o‘rganish texnologiyalari va raqamli ta’lim bo‘yicha mutaxassis.", avatar = "S" },
                new { name = "Dilnoza Karimova", role = "Bosh O‘qituvchi & Metodist", bio = "IELTS va CEFR standartlari bo‘yicha 8 yillik tajribaga ega ustoz.", avatar = "D" },
                new { name = "Jasur Aliyev", role = "Ta’lim Koordinator", bio = "Talabalar bilan ishlash va interaktiv mashqlar mutaxassisi.", avatar = "J" }
            },
            founderName = "Soxibjon Gaybullayev",
            founderBio = "TILSHUNOS platformasi asoschisi. O‘zbekiston yoshlariga jahon tillarini eng samarali va qulay usulda o‘rganish uchun innovatsion ekotizim yaratish ustida ishlaydi.",
            contacts = new
            {
                telegram = "@tilshunos",
                instagram = "tilshunos_app",
                email = "soxibgaybullayev439@gmail.com",
                phone = "+998 90 123 45 67"
            },
            footer = "© 2026 TILSHUNOS · Barcha huquqlar himoyalangan",
            contact = "hello@tilshunos.uz"
        });

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO system_settings (key, value_json, updated_at_utc) 
            VALUES ('welcome_cms', @valueJson, @updatedAt)
            ON CONFLICT (key) DO UPDATE 
            SET value_json = EXCLUDED.value_json, 
                updated_at_utc = EXCLUDED.updated_at_utc;
        ";

        var pVal = cmd.CreateParameter();
        pVal.ParameterName = "@valueJson";
        pVal.Value = sampleJson;
        cmd.Parameters.Add(pVal);

        var pDate = cmd.CreateParameter();
        pDate.ParameterName = "@updatedAt";
        pDate.Value = DateTime.UtcNow;
        cmd.Parameters.Add(pDate);

        var affected = await cmd.ExecuteNonQueryAsync();
        Assert.True(affected >= 1);

        // 3. Read back from Supabase
        using var readCmd = conn.CreateCommand();
        readCmd.CommandText = "SELECT value_json FROM system_settings WHERE key = 'welcome_cms' LIMIT 1;";
        var readResult = await readCmd.ExecuteScalarAsync();
        Assert.NotNull(readResult);
        Assert.Contains("Soxibjon Gaybullayev", readResult.ToString());
    }
}
