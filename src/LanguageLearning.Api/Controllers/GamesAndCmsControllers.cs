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
    private static CmsDataDto CurrentCms = new(
        Hero: "Yangi til. Yangi imkoniyatlar.",
        Description: "TILSHUNOS bilan har kuni oz-ozdan o‘rganing, bilimlaringizni amalda sinang va maqsadingizga ishonch bilan yaqinlashing.",
        Cta: "Bepul boshlash",
        About: "TILSHUNOS til o‘rganishni tartibli, qiziqarli va shaxsiy maqsadlaringizga mos qilish uchun yaratilayotgan ilg‘or platforma.",
        Header: "Imkoniyatlar, Biz haqimizda, Kirish",
        Footer: "© 2026 TILSHUNOS · Barcha huquqlar himoyalangan",
        Contact: "hello@tilshunos.uz"
    );

    [HttpGet]
    public IActionResult GetCms()
    {
        return Ok(CurrentCms);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut]
    public IActionResult UpdateCms([FromBody] CmsDataDto updated)
    {
        CurrentCms = updated;
        return Ok(new { success = true, message = "CMS ma’lumotlari muvaffaqiyatli saqlandi.", data = CurrentCms });
    }
}
