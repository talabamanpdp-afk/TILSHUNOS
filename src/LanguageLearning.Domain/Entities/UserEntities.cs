using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Learner;
    public bool EmailConfirmed { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAtUtc { get; set; }

    // Navigation
    public UserProfile? Profile { get; set; }
    public ICollection<UserLearningLanguage> LearningLanguages { get; set; } = new List<UserLearningLanguage>();
    public ICollection<RegisteredDevice> Devices { get; set; } = new List<RegisteredDevice>();
    public ICollection<PersonalVocabularyEntry> VocabularyEntries { get; set; } = new List<PersonalVocabularyEntry>();
    public ICollection<PracticeSession> PracticeSessions { get; set; } = new List<PracticeSession>();
    public TeacherProfile? TeacherProfile { get; set; }
}

public class UserProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string NativeLanguage { get; set; } = "uz"; // Native language for translations (e.g., Uzbek, English)
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public int DailyGoalMinutes { get; set; } = 20;
    public int CurrentStreakDays { get; set; } = 0;
    public DateTime? LastActiveDateUtc { get; set; }
    
    // Privacy settings
    public bool IsPublic { get; set; } = true;
    public bool ShowEmail { get; set; } = false;
    public bool ShowStreak { get; set; } = true;
    public bool ShowLearnedWords { get; set; } = true;
    public bool ShowStudyStatistics { get; set; } = true;
}

public class UserLearningLanguage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string LanguageCode { get; set; } = "en"; // en, de, es, tr, fr, ru
    public CefrLevel CurrentLevel { get; set; } = CefrLevel.A1;
    public bool IsPrimary { get; set; } = true;
    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
}
