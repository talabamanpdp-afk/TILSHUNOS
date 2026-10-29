using LanguageLearning.Application.DTOs;
using LanguageLearning.Application.Interfaces;
using LanguageLearning.Domain.Entities;
using LanguageLearning.Domain.Enums;
using LanguageLearning.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LanguageLearning.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public ProfileController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user == null) return NotFound();

        var profile = user.Profile ?? new UserProfile { UserId = user.Id };
        var primaryLang = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary) 
            ?? new UserLearningLanguage { LanguageCode = "en", CurrentLevel = CefrLevel.A1 };

        var dto = new UserProfileDto(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.Role,
            profile.NativeLanguage,
            profile.AvatarUrl,
            profile.Bio,
            profile.DailyGoalMinutes,
            profile.CurrentStreakDays,
            profile.IsPublic,
            profile.ShowEmail,
            profile.ShowStreak,
            profile.ShowLearnedWords,
            primaryLang.LanguageCode,
            primaryLang.CurrentLevel
        );

        return Ok(dto);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName.Trim();
        user.LastName = request.LastName.Trim();

        if (user.Profile == null)
        {
            user.Profile = new UserProfile { UserId = user.Id };
            _db.UserProfiles.Add(user.Profile);
        }

        user.Profile.Bio = request.Bio?.Trim();
        user.Profile.AvatarUrl = request.AvatarUrl?.Trim();
        user.Profile.DailyGoalMinutes = request.DailyGoalMinutes;
        user.Profile.IsPublic = request.IsPublic;
        user.Profile.ShowStreak = request.ShowStreak;
        user.Profile.ShowLearnedWords = request.ShowLearnedWords;

        await _db.SaveChangesAsync();
        return Ok(new { message = "Profile updated successfully." });
    }

    [HttpPost("onboarding")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] OnboardingRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user == null) return NotFound();

        if (user.Profile == null)
        {
            user.Profile = new UserProfile { UserId = user.Id };
            _db.UserProfiles.Add(user.Profile);
        }

        user.Profile.NativeLanguage = request.NativeLanguage.Trim();

        var existingLang = user.LearningLanguages.FirstOrDefault(l => l.LanguageCode == request.TargetLanguage);
        if (existingLang != null)
        {
            existingLang.CurrentLevel = request.Level;
            existingLang.IsPrimary = true;
        }
        else
        {
            // Reset other languages primary status
            foreach (var l in user.LearningLanguages) l.IsPrimary = false;

            user.LearningLanguages.Add(new UserLearningLanguage
            {
                UserId = user.Id,
                LanguageCode = request.TargetLanguage,
                CurrentLevel = request.Level,
                IsPrimary = true
            });
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Onboarding completed successfully." });
    }

    [AllowAnonymous]
    [HttpGet("public/{userId:guid}")]
    public async Task<IActionResult> GetPublicProfile(Guid userId)
    {
        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null || user.Profile?.IsPublic == false)
        {
            return NotFound(new { message = "Profile not found or is set to private." });
        }

        var profile = user.Profile;
        var primaryLang = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary) 
            ?? new UserLearningLanguage { LanguageCode = "en", CurrentLevel = CefrLevel.A1 };

        var verifiedWords = await _db.PersonalVocabularyEntries
            .CountAsync(v => v.UserId == userId && v.State == VocabularyState.Learned);

        var readingCompleted = await _db.MaterialProgressRecords
            .CountAsync(m => m.UserId == userId && m.IsCompleted && m.Material.ContentType == MaterialContentType.Story);

        var booksCompleted = await _db.MaterialProgressRecords
            .CountAsync(m => m.UserId == userId && m.IsCompleted && m.Material.ContentType == MaterialContentType.BookChapter);

        var writingSubs = await _db.AssignmentSubmissions
            .Where(s => s.StudentId == userId && s.TeacherGrade.HasValue)
            .ToListAsync();

        decimal? avgGrade = writingSubs.Count > 0 ? writingSubs.Average(s => s.TeacherGrade!.Value) : null;

        var listeningCompleted = await _db.MaterialProgressRecords
            .CountAsync(m => m.UserId == userId && m.IsCompleted && (m.Material.ContentType == MaterialContentType.AudioPodcast || m.Material.ContentType == MaterialContentType.VideoLesson));

        var speakingCompleted = await _db.MaterialProgressRecords
            .CountAsync(m => m.UserId == userId && m.IsCompleted && m.Material.ContentType == MaterialContentType.SpeakingTopic);

        var publicDto = new PublicProfileDto(
            user.Id,
            $"{user.FirstName} {user.LastName}",
            profile?.AvatarUrl,
            profile?.Bio,
            primaryLang.LanguageCode,
            primaryLang.CurrentLevel,
            verifiedWords,
            readingCompleted,
            booksCompleted,
            writingSubs.Count,
            avgGrade,
            listeningCompleted,
            speakingCompleted,
            profile?.CurrentStreakDays ?? 0
        );

        return Ok(publicDto);
    }

    [HttpGet("dashboard-summary")]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user == null) return NotFound();

        var primaryLang = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary)?.LanguageCode ?? "en";

        var vocabCounts = await _db.PersonalVocabularyEntries
            .Where(v => v.UserId == userId.Value && v.LanguageCode == primaryLang)
            .GroupBy(v => v.State)
            .Select(g => new { State = g.Key, Count = g.Count() })
            .ToListAsync();

        var plannedCount = vocabCounts.FirstOrDefault(x => x.State == VocabularyState.Planned)?.Count ?? 0;
        var inProgressCount = vocabCounts.FirstOrDefault(x => x.State == VocabularyState.InProgress)?.Count ?? 0;
        var learnedCount = vocabCounts.FirstOrDefault(x => x.State == VocabularyState.Learned)?.Count ?? 0;
        var needsReviewCount = vocabCounts.FirstOrDefault(x => x.State == VocabularyState.NeedsReview)?.Count ?? 0;
        var totalWords = plannedCount + inProgressCount + learnedCount + needsReviewCount;

        var activeTasksCount = await _db.Assignments
            .CountAsync(a => a.StudentId == userId.Value && a.Status != AssignmentStatus.Reviewed);

        // Calculate real practice time today and this week
        var nowUtc = DateTime.UtcNow;
        var todayStartUtc = new DateTime(nowUtc.Year, nowUtc.Month, nowUtc.Day, 0, 0, 0, DateTimeKind.Utc);
        var sevenDaysAgoUtc = todayStartUtc.AddDays(-6);

        var todaySessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId.Value && s.IsCompleted && s.CompletedAtUtc >= todayStartUtc)
            .ToListAsync();

        var todayMaterials = await _db.MaterialProgressRecords
            .Include(m => m.Material)
            .Where(m => m.UserId == userId.Value && m.IsCompleted && m.CompletedAtUtc >= todayStartUtc)
            .ToListAsync();

        int todayMinutes = (todaySessions.Count * 3) + todayMaterials.Sum(m => m.Material?.EstimatedMinutes ?? 5);

        // Weekly minutes
        var weeklySessions = await _db.PracticeSessions
            .Where(s => s.UserId == userId.Value && s.IsCompleted && s.CompletedAtUtc >= sevenDaysAgoUtc)
            .ToListAsync();

        var weeklyMaterials = await _db.MaterialProgressRecords
            .Include(m => m.Material)
            .Where(m => m.UserId == userId.Value && m.IsCompleted && m.CompletedAtUtc >= sevenDaysAgoUtc)
            .ToListAsync();

        int weeklyMinutes = (weeklySessions.Count * 3) + weeklyMaterials.Sum(m => m.Material?.EstimatedMinutes ?? 5);

        // Real Total XP (10 XP per correct question + material scores)
        var totalAttemptsCorrect = await _db.PracticeAttempts
            .CountAsync(a => a.Session.UserId == userId.Value && a.IsCorrect);
        var totalMaterialScore = await _db.MaterialProgressRecords
            .Where(m => m.UserId == userId.Value)
            .SumAsync(m => m.Score);
        int totalXP = (totalAttemptsCorrect * 10) + totalMaterialScore;

        var dailyGoalMinutes = user.Profile?.DailyGoalMinutes ?? 20;
        var dailyStreak = user.Profile?.CurrentStreakDays ?? 0;
        var longestStreak = user.Profile?.CurrentStreakDays ?? 0;

        return Ok(new
        {
            languageCode = primaryLang,
            currentLevel = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary)?.CurrentLevel.ToString() ?? "A1",
            dailyStreak = dailyStreak,
            longestStreak = longestStreak,
            dailyGoalMinutes = dailyGoalMinutes,
            todayMinutes = todayMinutes,
            weeklyMinutes = weeklyMinutes,
            totalXP = totalXP,
            totalWords = totalWords,
            plannedWords = plannedCount,
            inProgressWords = inProgressCount,
            learnedWords = learnedCount,
            needsReviewWords = needsReviewCount,
            activeTasksCount = activeTasksCount,
            newWordsToday = await _db.PersonalVocabularyEntries.CountAsync(v => v.UserId == userId.Value && v.CreatedAtUtc >= todayStartUtc),
            practiceCountToday = todaySessions.Count + todayMaterials.Count
        });
    }
}

[Authorize]
[ApiController]
[Route("api/v1/devices")]
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public DevicesController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyDevices()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var devices = await _db.RegisteredDevices
            .Where(d => d.UserId == userId.Value && !d.IsRevoked)
            .OrderByDescending(d => d.LastActiveAtUtc)
            .Select(d => new RegisteredDeviceDto(
                d.Id,
                d.DeviceName,
                d.DeviceType,
                d.Platform,
                d.Browser,
                d.IsPwaInstalled,
                d.CreatedAtUtc,
                d.LastActiveAtUtc
            ))
            .ToListAsync();

        return Ok(devices);
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        // Check if device with same Platform, Browser and DeviceType already registered for user
        var device = await _db.RegisteredDevices
            .FirstOrDefaultAsync(d => d.UserId == userId.Value && d.Platform == request.Platform && d.Browser == request.Browser && !d.IsRevoked);

        if (device != null)
        {
            device.LastActiveAtUtc = DateTime.UtcNow;
            if (request.IsPwaInstalled)
            {
                device.IsPwaInstalled = true;
                device.InstallMethod = request.InstallMethod ?? device.InstallMethod;
            }
            if (!string.IsNullOrWhiteSpace(request.DeviceName) && device.DeviceName == "Unknown Device")
            {
                device.DeviceName = request.DeviceName;
            }
        }
        else
        {
            device = new RegisteredDevice
            {
                UserId = userId.Value,
                DeviceName = string.IsNullOrWhiteSpace(request.DeviceName) ? $"{request.Platform} {request.DeviceType}" : request.DeviceName,
                DeviceType = request.DeviceType,
                Platform = request.Platform,
                Browser = request.Browser,
                IsPwaInstalled = request.IsPwaInstalled,
                InstallMethod = request.InstallMethod,
                CreatedAtUtc = DateTime.UtcNow,
                LastActiveAtUtc = DateTime.UtcNow
            };
            _db.RegisteredDevices.Add(device);
        }

        await _db.SaveChangesAsync();

        var dto = new RegisteredDeviceDto(
            device.Id, device.DeviceName, device.DeviceType, device.Platform, device.Browser, device.IsPwaInstalled, device.CreatedAtUtc, device.LastActiveAtUtc);

        return Ok(dto);
    }

    [HttpPut("{id:guid}/rename")]
    public async Task<IActionResult> RenameDevice(Guid id, [FromBody] RenameDeviceRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var device = await _db.RegisteredDevices.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId.Value);
        if (device == null) return NotFound(new { message = "Device not found." });

        device.DeviceName = request.NewDeviceName.Trim();
        await _db.SaveChangesAsync();

        return Ok(new { message = "Device renamed successfully." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RemoveDevice(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var device = await _db.RegisteredDevices.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId.Value);
        if (device == null) return NotFound(new { message = "Device not found." });

        device.IsRevoked = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Device removed successfully." });
    }
}
