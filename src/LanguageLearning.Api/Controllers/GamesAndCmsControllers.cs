using System.Collections.Concurrent;
using LanguageLearning.Application.Interfaces;
using LanguageLearning.Domain.Entities;
using LanguageLearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanguageLearning.Api.Controllers;

public record GameScoreSubmission(string GameMode, int Score, string? Topic, int CorrectAnswers);
public record WordVerificationRequest(string Word, string Topic, string? PreviousWord, string? Mode);
public record CmsDataDto(string Hero, string Description, string Cta, string About, string Header, string Footer, string Contact);
public record DuelChallengeRequest(string Topic, string OpponentName);
public record DuelSubmitRequest(string RoomId, string Word, int Round);
public record CreateGameTopicRequest(string TopicName);
public record AddTopicWordRequest(string Word);
public record UploadImageRequest(string DataBase64, string? FileName, string? ContentType);

[ApiController]
[Route("api/v1/games")]
public class GamesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    // In-memory persistent caches for dynamic topics and real-time scores
    private static readonly ConcurrentDictionary<string, List<string>> TopicWords = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Fruits & Food"] = new() { "apple", "banana", "orange", "grape", "pear", "peach", "strawberry", "watermelon", "cherry", "mango", "bread", "cheese", "rice", "soup" },
        ["Travel & Places"] = new() { "airport", "hotel", "ticket", "passport", "station", "subway", "flight", "luggage", "journey", "mountain", "beach", "city" },
        ["Daily Life"] = new() { "morning", "habit", "routine", "exercise", "breakfast", "dinner", "family", "friend", "home", "study", "work", "sleep" },
        ["Character & Mind"] = new() { "curious", "confident", "patient", "creative", "honest", "brave", "generous", "polite", "friendly", "focused" }
    };

    private static readonly ConcurrentBag<(string UserName, string Avatar, int Score, DateTime Timestamp)> RecentScores = new()
    {
        ("Jasur Aliyev", "J", 1420, DateTime.UtcNow.AddHours(-2)),
        ("Madina Karimova", "M", 1280, DateTime.UtcNow.AddHours(-5)),
        ("Dilnoza Rahimova", "D", 1150, DateTime.UtcNow.AddDays(-1)),
        ("Malika Saidova", "M", 980, DateTime.UtcNow.AddDays(-2)),
        ("Azizbek Umarov", "A", 870, DateTime.UtcNow.AddDays(-3))
    };

    private static readonly ConcurrentDictionary<string, (string Topic, string Player1, string Player2, int Score1, int Score2, string Status)> DuelRooms = new();

    public GamesController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpGet("topics")]
    public IActionResult GetGameTopics()
    {
        var topics = TopicWords.Select(kv => new
        {
            Topic = kv.Key,
            WordCount = kv.Value.Count,
            SampleWords = kv.Value.Take(4).ToList()
        }).ToList();

        return Ok(topics);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("topics")]
    public IActionResult CreateTopic([FromBody] CreateGameTopicRequest request)
    {
        var name = request.TopicName.Trim();
        if (string.IsNullOrWhiteSpace(name)) return BadRequest(new { message = "Mavzu nomi bo‘sh bo‘lishi mumkin emas." });

        TopicWords.TryAdd(name, new List<string>());
        return Ok(new { success = true, message = "Mavzu yaratildi." });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("topics/{topic}")]
    public IActionResult DeleteTopic(string topic)
    {
        TopicWords.TryRemove(topic, out _);
        return Ok(new { success = true, message = "Mavzu o‘chirildi." });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("topics/{topic}/words")]
    public IActionResult AddWordToTopic(string topic, [FromBody] AddTopicWordRequest request)
    {
        var word = request.Word.Trim().ToLowerInvariant();
        if (!TopicWords.ContainsKey(topic)) TopicWords[topic] = new List<string>();

        if (!TopicWords[topic].Contains(word))
        {
            TopicWords[topic].Add(word);
        }
        return Ok(new { success = true, message = "So‘z qo‘shildi." });
    }

    [HttpGet("waiting-players")]
    public IActionResult GetWaitingPlayers([FromQuery] string? topic)
    {
        var selectedTopic = topic ?? "Fruits & Food";
        var waiting = new[]
        {
            new { Id = "p-1", Name = "Jasur Aliyev", Avatar = "J", Level = "B1", Rating = 1420, WinRate = "84%", Status = "Kutmoqda", Topic = selectedTopic },
            new { Id = "p-2", Name = "Madina Karimova", Avatar = "M", Level = "A2", Rating = 1280, WinRate = "76%", Status = "Kutmoqda", Topic = selectedTopic },
            new { Id = "p-3", Name = "Malika Saidova", Avatar = "M", Level = "B2", Rating = 1540, WinRate = "91%", Status = "Kutmoqda", Topic = selectedTopic },
            new { Id = "p-4", Name = "Azizbek Umarov", Avatar = "A", Level = "A1", Rating = 870, WinRate = "68%", Status = "Kutmoqda", Topic = selectedTopic }
        };

        return Ok(waiting);
    }

    [HttpPost("challenge")]
    public IActionResult ChallengePlayer([FromBody] DuelChallengeRequest request)
    {
        var roomId = "duel-" + Guid.NewGuid().ToString("N")[..8];
        var me = "Siz";
        DuelRooms[roomId] = (request.Topic, me, request.OpponentName, 0, 0, "Active");

        return Ok(new
        {
            success = true,
            roomId,
            opponent = request.OpponentName,
            topic = request.Topic,
            message = $"{request.OpponentName} taklifingizni qabul qildi! Bellashuv boshlandi."
        });
    }

    [HttpPost("submit-duel-word")]
    public IActionResult SubmitDuelWord([FromBody] DuelSubmitRequest request)
    {
        var word = request.Word.Trim().ToLowerInvariant();
        var isValid = word.Length >= 3;
        var myPoints = isValid ? 15 : 0;
        var opponentPoints = (new Random().Next(1, 10) > 3) ? 15 : 10;

        return Ok(new
        {
            valid = isValid,
            myPoints,
            opponentPoints,
            message = isValid ? "To‘g‘ri so‘z! (+15 XP)" : "So‘z topilmadi (0 XP)"
        });
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var dbTopUsers = await _db.UserProfiles
            .Include(p => p.User)
            .OrderByDescending(p => p.CurrentStreakDays)
            .Take(10)
            .Select(p => new
            {
                Name = $"{p.User.FirstName} {p.User.LastName}".Trim(),
                Avatar = !string.IsNullOrEmpty(p.User.FirstName) ? p.User.FirstName.Substring(0, 1).ToUpper() : "U",
                Score = 800 + (p.CurrentStreakDays * 120),
                Rank = 1
            })
            .ToListAsync();

        if (dbTopUsers.Count == 0)
        {
            var fallback = RecentScores
                .OrderByDescending(s => s.Score)
                .Take(5)
                .Select((s, idx) => new
                {
                    Name = s.UserName,
                    Avatar = s.Avatar,
                    Score = s.Score,
                    Rank = idx + 1
                })
                .ToList();
            return Ok(fallback);
        }

        var ranked = dbTopUsers
            .OrderByDescending(u => u.Score)
            .Select((u, idx) => new
            {
                u.Name,
                u.Avatar,
                u.Score,
                Rank = idx + 1
            });

        return Ok(ranked);
    }

    [HttpPost("verify-word")]
    public IActionResult VerifyWord([FromBody] WordVerificationRequest request)
    {
        var word = request.Word.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(word))
        {
            return BadRequest(new { valid = false, message = "So‘z bo‘sh bo‘lishi mumkin emas." });
        }

        // Mode: Word Chain
        if (string.Equals(request.Mode, "chain", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(request.PreviousWord))
        {
            var prev = request.PreviousWord.Trim().ToLowerInvariant();
            var lastChar = prev.Last();
            if (word.First() != lastChar)
            {
                return Ok(new
                {
                    valid = false,
                    message = $"So‘z '{char.ToUpper(lastChar)}' harfi bilan boshlanishi kerak!"
                });
            }

            return Ok(new
            {
                valid = true,
                points = 10,
                message = $"Ajoyib! '{word.ToUpper()}' qabul qilindi. Keyingi harf: '{char.ToUpper(word.Last())}'"
            });
        }

        // Mode: Topic Typing
        if (!string.IsNullOrWhiteSpace(request.Topic) && TopicWords.TryGetValue(request.Topic, out var wordsList))
        {
            var found = wordsList.Any(w => w.Equals(word, StringComparison.OrdinalIgnoreCase));
            if (found)
            {
                return Ok(new
                {
                    valid = true,
                    points = 10,
                    message = $"To‘g‘ri! '{word.ToUpper()}' mazkur mavzuga tegishli. (+10 ball 🎉)"
                });
            }

            if (word.Length >= 3)
            {
                return Ok(new
                {
                    valid = true,
                    points = 5,
                    message = $"Yaxshi so‘z! (+5 ball)"
                });
            }

            return Ok(new
            {
                valid = false,
                message = "Bu so‘z ushbu mavzu ro‘yxatida topilmadi. Boshqa so‘z yozib ko‘ring."
            });
        }

        return Ok(new { valid = word.Length >= 2, points = 5, message = "Qabul qilindi!" });
    }

    [HttpPost("submit-score")]
    public async Task<IActionResult> SubmitScore([FromBody] GameScoreSubmission request)
    {
        var userId = _currentUserService.UserId;
        var userName = "Foydalanuvchi";
        var avatar = "F";

        if (userId.HasValue)
        {
            var user = await _db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId.Value);
            if (user != null)
            {
                userName = $"{user.FirstName} {user.LastName}".Trim();
                avatar = user.FirstName.Length > 0 ? user.FirstName.Substring(0, 1).ToUpper() : "U";
            }
        }

        RecentScores.Add((userName, avatar, request.Score, DateTime.UtcNow));

        return Ok(new
        {
            success = true,
            score = request.Score,
            earnedXp = request.Score,
            message = $"{request.Score} XP hisobingizga qo‘shildi!"
        });
    }
}

[ApiController]
[Route("api/v1/cms")]
public class CmsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;

    public CmsController(AppDbContext db, IConfiguration config, IHttpClientFactory httpClientFactory)
    {
        _db = db;
        _config = config;
        _httpClientFactory = httpClientFactory;
    }

    private static readonly string DefaultCmsJson = System.Text.Json.JsonSerializer.Serialize(new
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
            useLiveStats = false, // When true, uses real live calculated database numbers
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

    [HttpGet]
    public async Task<IActionResult> GetCms()
    {
        // 1. Calculate real live database statistics dynamically
        int liveUsers = 0;
        int liveWords = 0;
        int livePractices = 0;
        int liveMaterials = 0;
        int liveTeachers = 0;

        try
        {
            liveUsers = await _db.Users.CountAsync();
            liveWords = await _db.PersonalVocabularyEntries.CountAsync() + await _db.PublishedVocabularyCollectionEntries.CountAsync();
            livePractices = await _db.PracticeAttempts.CountAsync();
            liveMaterials = await _db.LearningMaterials.CountAsync();
            liveTeachers = await _db.TeacherProfiles.CountAsync();
        }
        catch { }

        var liveStatsObj = new Dictionary<string, object>
        {
            ["usersCount"] = liveUsers,
            ["wordsCount"] = liveWords,
            ["practicesCount"] = livePractices,
            ["materialsCount"] = liveMaterials,
            ["teachersCount"] = liveTeachers
        };

        try
        {
            await _db.Database.ExecuteSqlRawAsync(
                "CREATE TABLE IF NOT EXISTS system_settings (key character varying(128) PRIMARY KEY, value_json text NOT NULL, updated_at_utc timestamp with time zone NOT NULL);"
            );

            var conn = _db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT value_json FROM system_settings WHERE key = 'welcome_cms' LIMIT 1;";
            var result = await cmd.ExecuteScalarAsync();

            string jsonToReturn = DefaultCmsJson;
            if (result != null && result != DBNull.Value)
            {
                var val = result.ToString();
                if (!string.IsNullOrWhiteSpace(val))
                {
                    jsonToReturn = val;
                }
            }
            else
            {
                // Seed default to Supabase
                using var insertCmd = conn.CreateCommand();
                insertCmd.CommandText = "INSERT INTO system_settings (key, value_json, updated_at_utc) VALUES ('welcome_cms', @val, @date) ON CONFLICT (key) DO NOTHING;";
                var pVal = insertCmd.CreateParameter();
                pVal.ParameterName = "@val";
                pVal.Value = DefaultCmsJson;
                insertCmd.Parameters.Add(pVal);

                var pDate = insertCmd.CreateParameter();
                pDate.ParameterName = "@date";
                pDate.Value = DateTime.UtcNow;
                insertCmd.Parameters.Add(pDate);

                await insertCmd.ExecuteNonQueryAsync();
            }

            // Parse json and inject liveStats
            var rootDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(jsonToReturn) ?? new();
            rootDict["liveStats"] = liveStatsObj;

            return Ok(rootDict);
        }
        catch
        {
            var fallbackDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(DefaultCmsJson) ?? new();
            fallbackDict["liveStats"] = liveStatsObj;
            return Ok(fallbackDict);
        }
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateCms([FromBody] System.Text.Json.JsonElement updated)
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToLowerInvariant();
        if (role != "admin" && role != "superadmin")
        {
            return Forbid();
        }

        try
        {
            await _db.Database.ExecuteSqlRawAsync(
                "CREATE TABLE IF NOT EXISTS system_settings (key character varying(128) PRIMARY KEY, value_json text NOT NULL, updated_at_utc timestamp with time zone NOT NULL);"
            );

            var jsonString = updated.GetRawText();
            var conn = _db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

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
            pVal.Value = jsonString;
            cmd.Parameters.Add(pVal);

            var pDate = cmd.CreateParameter();
            pDate.ParameterName = "@updatedAt";
            pDate.Value = DateTime.UtcNow;
            cmd.Parameters.Add(pDate);

            await cmd.ExecuteNonQueryAsync();

            return Ok(new { success = true, message = "CMS ma’lumotlari Supabasega muvaffaqiyatli saqlandi.", data = updated });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Supabasega saqlashda xatolik: " + ex.Message });
        }
    }

    [Authorize]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage([FromBody] UploadImageRequest request)
    {
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value?.ToLowerInvariant();
        if (role != "admin" && role != "superadmin")
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(request?.DataBase64))
        {
            return BadRequest(new { error = "Rasm ma'lumotlari topilmadi." });
        }

        try
        {
            var mediaId = "media_" + Guid.NewGuid().ToString("N")[..12];
            var contentType = string.IsNullOrWhiteSpace(request.ContentType) ? "image/jpeg" : request.ContentType;
            var ext = contentType switch
            {
                "image/png" => ".png",
                "image/webp" => ".webp",
                "image/svg+xml" => ".svg",
                _ => ".jpg"
            };
            var fileName = string.IsNullOrWhiteSpace(request.FileName) 
                ? $"{mediaId}{ext}" 
                : $"{Path.GetFileNameWithoutExtension(request.FileName)}_{Guid.NewGuid().ToString("N")[..6]}{ext}";

            // Extract byte array from DataBase64
            var base64Data = request.DataBase64;
            if (base64Data.Contains(','))
            {
                base64Data = base64Data.Substring(base64Data.IndexOf(',') + 1);
            }
            var fileBytes = Convert.FromBase64String(base64Data);

            // 1. Upload to Supabase Storage Bucket ('tilshunos-media')
            var supabaseUrl = _config["Supabase:Url"] ?? "https://yipexommqztxnvpckqyi.supabase.co";
            var anonKey = _config["Supabase:AnonKey"];
            var bucketName = _config["Supabase:BucketName"] ?? "tilshunos-media";

            string? supabaseCdnUrl = null;

            if (!string.IsNullOrWhiteSpace(anonKey))
            {
                try
                {
                    var client = _httpClientFactory.CreateClient();
                    var uploadUrl = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucketName}/{fileName}";
                    using var content = new ByteArrayContent(fileBytes);
                    content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

                    using var req = new HttpRequestMessage(HttpMethod.Post, uploadUrl)
                    {
                        Content = content
                    };
                    req.Headers.Add("Authorization", $"Bearer {anonKey}");
                    req.Headers.Add("apikey", anonKey);

                    var response = await client.SendAsync(req);
                    if (response.IsSuccessStatusCode)
                    {
                        supabaseCdnUrl = $"{supabaseUrl.TrimEnd('/')}/storage/v1/object/public/{bucketName}/{fileName}";
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"Supabase Storage upload error: {ex.Message}");
                }
            }

            // 2. Also save record in uploaded_media for fallback
            await _db.Database.ExecuteSqlRawAsync(
                "CREATE TABLE IF NOT EXISTS uploaded_media (id character varying(64) PRIMARY KEY, file_name character varying(255) NOT NULL, content_type character varying(64) NOT NULL, data_base64 text NOT NULL, created_at_utc timestamp with time zone NOT NULL);"
            );

            var paramId = new Npgsql.NpgsqlParameter("@id", mediaId);
            var paramName = new Npgsql.NpgsqlParameter("@fileName", fileName);
            var paramType = new Npgsql.NpgsqlParameter("@contentType", contentType);
            var paramData = new Npgsql.NpgsqlParameter("@data", request.DataBase64);
            var paramDate = new Npgsql.NpgsqlParameter("@date", DateTime.UtcNow);

            await _db.Database.ExecuteSqlRawAsync(
                "INSERT INTO uploaded_media (id, file_name, content_type, data_base64, created_at_utc) VALUES (@id, @fileName, @contentType, @data, @date);",
                paramId, paramName, paramType, paramData, paramDate
            );

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var fallbackUrl = $"{baseUrl}/api/v1/cms/media/{mediaId}";
            var finalUrl = supabaseCdnUrl ?? fallbackUrl;

            return Ok(new
            {
                success = true,
                id = mediaId,
                url = finalUrl,
                relativeUrl = fallbackUrl,
                bucketUrl = supabaseCdnUrl,
                message = supabaseCdnUrl != null 
                    ? "Rasm Supabase Storage 'tilshunos-media' bucketiga muvaffaqiyatli yuklandi!" 
                    : "Rasm saqlandi."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Supabasega yuklashda xatolik: " + ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("media/{id}")]
    public async Task<IActionResult> GetMedia(string id)
    {
        try
        {
            var conn = _db.Database.GetDbConnection();
            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT content_type, data_base64 FROM uploaded_media WHERE id = @id LIMIT 1;";
            var p = cmd.CreateParameter();
            p.ParameterName = "@id";
            p.Value = id;
            cmd.Parameters.Add(p);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var contentType = reader.GetString(0);
                var base64 = reader.GetString(1);
                if (base64.Contains(','))
                {
                    base64 = base64.Substring(base64.IndexOf(',') + 1);
                }
                var bytes = Convert.FromBase64String(base64);
                Response.Headers["Cache-Control"] = "public, max-age=31536000";
                return File(bytes, contentType);
            }
            return NotFound();
        }
        catch
        {
            return NotFound();
        }
    }
}
