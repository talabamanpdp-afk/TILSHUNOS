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

        var fullCmsJson = System.Text.Json.JsonSerializer.Serialize(new
        {
            hero = "Yangi tilni erkin gapiring",
            heroBadge = "99 PERCENT",
            heroBadgeFull = "TILSHUNOS 2.0 · ILG‘OR TIL O‘RGANISH EKOTIZIMI",
            heroImage = "/hero-tutor.jpg",
            heroMobileImage = "/hero-tutor.jpg",
            description = "TILSHUNOS bilan har kuni tizimli o‘rganing, CEFR standartlarida bilimingizni mustahkamlang va erkin muloqotga chiqing.",
            cta = "Bepul boshlash",
            secondaryCta = "Platformani o‘rganish",
            header = "Imkoniyatlar, Biz haqimizda, Kirish",

            // Statistics & Floating Badges
            metrics = new
            {
                useLiveStats = false,
                metric1Value = "6 M",
                metric1Label = "App Downloads",
                metric2Value = "8.24 M",
                metric2Label = "Learned monthly",
                metric3Value = "4.8",
                metric3Label = "177k Rating"
            },
            floatingBadge1 = new
            {
                flag = "🇬🇧",
                title = "Basic English",
                subtitle = "103 Lesson"
            },
            floatingBadge2 = new
            {
                title = "9 / 12 Quiz",
                subtitle = "Speaking ✓"
            },

            // Interactive Preview Section
            previewSection = new
            {
                kicker = "AMALIY TAJRIBA",
                title = "Platformaning haqiqiy imkoniyatlarini sinab ko‘ring",
                subtitle = "Ro‘yxatdan o‘tishdan avval asosiy 3 ta modulimiz qanday ishlashini amalda ko‘ring.",
                vocabItems = new[]
                {
                    new { word = "Achieve", tr = "Erishmoq, zabt etmoq", lvl = "B1", ex = "You can achieve any language goal with daily practice.", topic = "Motivatsiya" },
                    new { word = "Curious", tr = "Qiziquvchan, yangilikka intiluvchan", lvl = "A2", ex = "Children are naturally curious about the world.", topic = "Xarakter" },
                    new { word = "Resilience", tr = "Sabr-bardosh, chidamlilik", lvl = "B2", ex = "She showed great resilience in learning pronunciation.", topic = "Psixologiya" }
                },
                sampleLesson = new
                {
                    level = "CEFR B1 · READING",
                    time = "5 daqiqa",
                    title = "The Power of Tiny Daily Habits",
                    article = "Consistency is far more powerful than intensity. When learning a new language, practicing for just 15 minutes every single day wires the brain more effectively than studying for 4 hours once a week. The secret lies in frequent retrieval: each time you actively recall a word, the neural pathway strengthens.",
                    question = "Matnga ko‘ra, til o‘rganishda eng muhim omil nima?",
                    choiceA = "Har kuni muntazam 15 daqiqa shug‘ullanish (To‘g‘ri ✓)",
                    choiceB = "Faqat haftada bir marta 4 soat o‘rganish"
                }
            },

            // CEFR Roadmap Section
            cefrSection = new
            {
                kicker = "XALQARO METODIKA",
                title = "CEFR bo‘yicha aniq yo‘l xaritasi (A1–C2)",
                subtitle = "O‘zingizga mos boshlang‘ich nuqtani tanlang va bosqichma-bosqich yuksaling.",
                levels = new[]
                {
                    new { code = "A1", name = "Boshlang‘ich", desc = "Oddiy so‘zlar, tanishuv va kundalik eng muhim iboralar.", color = "#3b82f6" },
                    new { code = "A2", name = "Elementar", desc = "Xarid, transport va oddiy kundalik vaziyatlarda muloqot.", color = "#0ea5e9" },
                    new { code = "B1", name = "O‘rta daraja", desc = "Sayohat, fikr bildirish va o‘z tajribasini erkin tushuntirish.", color = "#10b981" },
                    new { code = "B2", name = "Mustaqil", desc = "Murakkab matnlar, insholar va mavzular bo‘yicha erkin bahslashish.", color = "#8b5cf6" },
                    new { code = "C1", name = "Ilg‘or", desc = "Akademik va kasbiy darajada chuqur fikrlash hamda tahlil.", color = "#f59e0b" },
                    new { code = "C2", name = "Mukammal", desc = "Ona tili darajasidagi ravonlik va nozik ma’nolarni anglash.", color = "#ec4899" }
                }
            },

            // 5 Ko'nikma (Skills) Section
            skillsSection = new
            {
                kicker = "MUVOZANATLI RIVOJLANISH",
                title = "5 ta asosiy til ko‘nikmasini mustahkamlang",
                subtitle = "Faqat qoidalar yodlash emas — har tomonlama tabiiy o‘rganish uslubi.",
                skills = new[]
                {
                    new { key = "reading", title = "O‘qish (Reading)", desc = "Darajangizga moslangan qiziqarli hikoyalar, badiiy parchalar va zamonaviy maqolalar.", color = "#356cf6" },
                    new { key = "writing", title = "Yozish (Writing)", desc = "Insho va xatlar yozish, grammatik xatolarni sun’iy intellekt orqali darhol tekshirish.", color = "#8b5cf6" },
                    new { key = "listening", title = "Tinglash (Listening)", desc = "Tabiiy tezlikdagi audio podkastlar, kundalik muloqot dialoglari va transkriptlar.", color = "#0ea5e9" },
                    new { key = "speaking", title = "Gapirish (Speaking)", desc = "To‘g‘ri talaffuz va intonatsiya mashqlari bilan muloqotdagi to‘siqlarni yengish.", color = "#10b981" },
                    new { key = "vocabulary", title = "Lug‘at (Vocabulary)", desc = "Shaxsiy so‘z daftari, kontekstual misollar va intervalli takrorlash metodikasi.", color = "#f59e0b" }
                }
            },

            // 5 Qadam (How It Works) Section
            stepsSection = new
            {
                kicker = "ODDIY VA TUSHUNARLI",
                title = "O‘rganish jarayoni qanday kechadi?",
                subtitle = "5 ta oson qadam orqali maqsadingiz sari ishonch bilan yo‘l oling.",
                steps = new[]
                {
                    new { step = "01", title = "Til va maqsadni tanlaysiz", desc = "Ingliz, rus, nemis yoki boshqa tillar hamda kunlik shug‘ullanish vaqti." },
                    new { step = "02", title = "Boshlang‘ich daraja aniqlanadi", desc = "CEFR A1 dan C2 gacha bo‘lgan aniq darajangiz belgilanadi." },
                    new { step = "03", title = "Shaxsiy reja tuziladi", desc = "Dashboardda har kungi yangi so‘zlar va mashqlar tartibli aks etadi." },
                    new { step = "04", title = "Amaliyot va so‘z o‘yinlari", desc = "Typing, so‘z zanjiri va 1v1 bellashuvlar orqali bilim mustahkamlanadi." },
                    new { step = "05", title = "Natijalar va o‘sish", desc = "O‘zlashtirilgan so‘zlar va yuqori CEFR darajalariga o‘tish." }
                }
            },

            // Features Section
            featuresSection = new
            {
                kicker = "ILG‘OR IMKONIYATLAR",
                title = "Zamonaviy texnologiyalar xizmatingizda",
                subtitle = "Biz til o‘rganishni nafaqat samarali, balki maroqli jarayonga aylantiramiz.",
                features = new[]
                {
                    new { key = "ai", color = "purple", title = "24/7 AI Til Repetitori", desc = "Istalgan savolingizni bering, grammatik xatolaringizni aniqlang va muloyim tushuntirishlar oling." },
                    new { key = "pvp", color = "orange", title = "1v1 So‘z Bellashuvi", desc = "Boshqa o‘quvchilar bilan real vaqtda so‘z boyligingizni sinang, XP to‘plang va yetakchilar safiga kiring." },
                    new { key = "anticheat", color = "green", title = "Anti-Cheat & Spaced Repetition", desc = "So‘zlar tasodifiy takrorlanmaydi — ilmiy tasdiqlangan intervallar bilan uzoq muddatli xotiraga ko‘chadi." },
                    new { key = "teachers", color = "blue", title = "Malakali Ustozlar Nazorati", desc = "Maxsus o‘qituvchilar tizimda sizning yozma insho va vazifalaringizni tekshirib, shaxsiy baho beradi." }
                }
            },

            // About Us & Team
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

            // FAQ
            faqs = new[]
            {
                new { q = "TILSHUNOS platformasidan foydalanish bepulmi?", a = "Ha, asosiy funksiyalar — so‘z yodlash, mashqlar, CEFR reading va listening materiallari barcha uchun bepul." },
                new { q = "CEFR darajalarini qanday aniqlayman?", a = "Ro‘yxatdan o‘tish chog‘ida darajangizni (A1–C2) o‘zingiz belgilashingiz yoki qisqa diagnostik test orqali aniqlab olishingiz mumkin." },
                new { q = "Mobil qurilmalarda ishlaydimi?", a = "Ha, TILSHUNOS responsive veb-ilova va PWA (Progressive Web App) sifatida smartfon va planshetlarda qulay ishlaydi." },
                new { q = "O‘qituvchi bilan qanday bog‘lanaman?", a = "Platformadagi O‘qituvchilar bo‘limi orqali tasdiqlangan ustozlar bilan bog‘lanib, shaxsiy topshiriqlar olishingiz mumkin." }
            },

            // Final CTA
            finalCta = new
            {
                kicker = "HOZIROQ BOSHLANG",
                title = "Yangi tilni erkin gapirish vaqti keldi",
                desc = "Bir necha soniyada bepul ro‘yxatdan o‘ting va birinchi darsingizni bugunoq boshlang.",
                btnRegister = "Bepul hisob yaratish",
                btnLogin = "Tizimga kirish"
            },

            // Footer & Contacts
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
        pVal.Value = fullCmsJson;
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
        Assert.Contains("metrics", readResult.ToString());
        Assert.Contains("previewSection", readResult.ToString());
        Assert.Contains("cefrSection", readResult.ToString());
        Assert.Contains("skillsSection", readResult.ToString());
    }
}
