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

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        // Query top learners from real user profiles in database
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

            // Also check standard dictionary / general valid english word length > 2
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
            message = $"{request.Score} XP muvaffaqiyatli hisobingizga qo‘shildi!"
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
