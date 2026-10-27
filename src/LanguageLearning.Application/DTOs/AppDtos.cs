using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Application.DTOs;

// --- Auth DTOs ---
public record RegisterRequest(string FirstName, string LastName, string Email, string Password, string ConfirmPassword);
public record LoginRequest(string Email, string Password);
public record GoogleAuthRequest(string IdToken, string? Email = null, string? FirstName = null, string? LastName = null);
public record VerifyEmailRequest(string Email, string Code);
public record ResendCodeRequest(string Email);
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record AuthResponse(string Token, UserDto User, bool IsNewUser = false);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    UserRole Role,
    bool EmailConfirmed,
    string? NativeLanguage,
    string? TargetLanguage,
    CefrLevel? CurrentLevel
);

// --- Profile & Onboarding DTOs ---
public record OnboardingRequest(string TargetLanguage, CefrLevel Level, string NativeLanguage);
public record UpdateProfileRequest(string FirstName, string LastName, string? Bio, string? AvatarUrl, int DailyGoalMinutes, bool IsPublic, bool ShowStreak, bool ShowLearnedWords);
public record UserProfileDto(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    UserRole Role,
    string NativeLanguage,
    string? AvatarUrl,
    string? Bio,
    int DailyGoalMinutes,
    int CurrentStreakDays,
    bool IsPublic,
    bool ShowEmail,
    bool ShowStreak,
    bool ShowLearnedWords,
    string PrimaryLanguageCode,
    CefrLevel PrimaryLevel
);

public record PublicProfileDto(
    Guid UserId,
    string DisplayName,
    string? AvatarUrl,
    string? Bio,
    string TargetLanguage,
    CefrLevel Level,
    int VerifiedLearnedWordsCount,
    int ReadingStoriesCompleted,
    int BooksCompleted,
    int WritingSubmissionsCount,
    decimal? AverageWritingGrade,
    int ListeningCompletedCount,
    int SpeakingPracticesCount,
    int StreakDays
);

// --- Device DTOs ---
public record RegisterDeviceRequest(string DeviceName, string DeviceType, string Platform, string Browser, bool IsPwaInstalled, string? InstallMethod);
public record RenameDeviceRequest(string NewDeviceName);
public record RegisteredDeviceDto(Guid Id, string DeviceName, string DeviceType, string Platform, string Browser, bool IsPwaInstalled, DateTime CreatedAtUtc, DateTime LastActiveAtUtc);

// --- Vocabulary DTOs ---
public record CreateVocabularyEntryRequest(
    string TargetWord,
    string NativeTranslation,
    string LanguageCode,
    string? ExampleSentence,
    string? Hint,
    string? PersonalNote,
    string? Topic,
    string? PartOfSpeech,
    string? Phonetic
);

public record UpdateVocabularyEntryRequest(
    string TargetWord,
    string NativeTranslation,
    string? ExampleSentence,
    string? Hint,
    string? PersonalNote,
    string? Topic,
    string? PartOfSpeech,
    string? Phonetic
);

public record VocabularyEntryDto(
    Guid Id,
    string LanguageCode,
    string TargetWord,
    string NativeTranslation,
    string? ExampleSentence,
    string? Hint,
    string? PersonalNote,
    string? Topic,
    string? PartOfSpeech,
    string? Phonetic,
    VocabularyState State,
    int ConsecutiveCorrectCount,
    int TotalAttempts,
    int SuccessfulAttempts,
    DateTime? LastAttemptAtUtc,
    DateTime? VerifiedLearnedAtUtc,
    DateTime CreatedAtUtc
);

public record VocabularyStatsDto(
    int TotalPlanned,
    int TotalInProgress,
    int TotalLearned,
    int TotalNeedsReview,
    int TotalArchived,
    int AccuracyPercentage
);

// --- Practice Session DTOs ---
public record StartPracticeSessionRequest(
    string LanguageCode,
    PracticeDirection Direction,
    int SessionSize,
    bool IncludeLearnedWords,
    string? TopicFilter
);

public record PracticeQuestionDto(
    Guid EntryId,
    string PromptWord,
    string DirectionPrompt,
    string? PartOfSpeech,
    string? Topic,
    bool HasHint
);

public record PracticeSessionDto(
    Guid SessionId,
    PracticeDirection Direction,
    int TotalQuestions,
    int HintsRemaining,
    List<PracticeQuestionDto> Questions
);

public record SubmitPracticeAnswerRequest(
    Guid SessionId,
    Guid EntryId,
    string SubmittedAnswer,
    bool UsedHint
);

public record PracticeAttemptResultDto(
    bool IsCorrect,
    string SubmittedAnswer,
    string CorrectAnswer,
    string? ExampleSentence,
    int ConsecutiveCorrect,
    VocabularyState CurrentState,
    int HintsRemaining
);

public record PracticeSessionSummaryDto(
    Guid SessionId,
    int TotalQuestions,
    int CorrectAnswers,
    int IncorrectAnswers,
    int AccuracyPercentage,
    int HintsUsed,
    List<VocabularyEntryDto> PromotedToLearnedWords,
    List<VocabularyEntryDto> NeedsReviewWords
);

// --- Public Collections ---
public record CreatePublicCollectionRequest(
    string Title,
    string Description,
    string TargetLanguage,
    CefrLevel Level,
    string Topic,
    List<CreateCollectionEntryItem> Entries
);
public record CreateCollectionEntryItem(string TargetWord, string NativeTranslation, string? ExampleSentence, string? PartOfSpeech, string? Topic);
public record PublishedCollectionDto(
    Guid Id,
    string Title,
    string Description,
    string TargetLanguage,
    CefrLevel Level,
    string Topic,
    string AuthorName,
    int WordCount,
    int CopyCount,
    DateTime CreatedAtUtc
);

// --- Materials & Learning Center ---
public record LearningMaterialDto(
    Guid Id,
    Guid? ContentGroupId,
    string Title,
    string Description,
    MaterialContentType ContentType,
    CefrLevel Level,
    string LanguageCode,
    string ContentBody,
    string? AudioUrl,
    string? VideoUrl,
    string? SourceUrl,
    string? Attribution,
    int EstimatedMinutes,
    string? VocabularyListJson,
    string? ComprehensionQuestionsJson,
    bool IsCompleted,
    int UserScore,
    List<LevelVersionInfoDto>? AvailableVersions
);

public record LevelVersionInfoDto(Guid MaterialId, CefrLevel Level, string Title);
public record RecordMaterialProgressRequest(int Score, int ProgressPercentage, bool MarkCompleted);

// --- Teachers & Tasks ---
public record TeacherProfileDto(
    Guid UserId,
    string Name,
    string? AvatarUrl,
    string Bio,
    string Qualifications,
    string LanguagesTaught,
    string CefrLevelsTaught,
    string? ExternalContactUrl,
    decimal? HourlyRate,
    int TeachingExperienceYears,
    bool IsApproved
);

public record ConnectionRequestDto(Guid ConnectionId, Guid TeacherId, string TeacherName, Guid StudentId, string StudentName, ConnectionStatus Status, DateTime RequestedAtUtc);
public record CreateAssignmentRequest(Guid StudentId, string Title, string Instructions, AssignmentType TaskType, CefrLevel Level, string LanguageCode, DateTime? DueDateUtc, decimal MaxScore, string? AttachmentJson);
public record AssignmentDto(
    Guid Id,
    Guid TeacherId,
    string TeacherName,
    Guid StudentId,
    string StudentName,
    string Title,
    string Instructions,
    AssignmentType TaskType,
    CefrLevel Level,
    string LanguageCode,
    DateTime? DueDateUtc,
    AssignmentStatus Status,
    decimal MaxScore,
    string? AttachmentJson,
    decimal? Grade,
    string? Feedback,
    DateTime CreatedAtUtc
);

public record SubmitAssignmentRequest(string Content);
public record GradeAssignmentRequest(decimal Grade, string Feedback, string? RubricCriteriaJson);

// --- Writing Module ---
public record SaveDraftRequest(WritingGenre Genre, string Title, string Content);
public record WritingDraftDto(Guid Id, WritingGenre Genre, string Title, string Content, int WordCount, int CharacterCount, string? AiFeedbackJson, bool IsSubmitted, DateTime UpdatedAtUtc);

// --- AI Assistant ---
public record AiChatRequest(string Message, string? TargetLanguage, CefrLevel? Level, Guid? ConversationId);
public record AiChatResponseDto(Guid ConversationId, string Reply);
public record AiWritingAnalysisRequest(string Text, WritingGenre Genre, string TargetLanguage, CefrLevel Level);
public record AiWritingAnalysisDto(string FeedbackMarkdown, int ScoreEstimate, List<string> Suggestions);

// --- Admin ---
public record AdminDashboardStatsDto(
    int TotalUsers,
    int VerifiedUsers,
    int ActiveTeachers,
    int TotalVocabularyEntries,
    int TotalMaterials,
    int TotalAssignments,
    int TotalPracticeSessions,
    Dictionary<string, int>? StudentsByLevel
);

public record CreateTeacherAccountRequest(string FirstName, string LastName, string Email, string Password, string Specialty, string? Bio);
public record UpdateTeacherProfileDetailsRequest(string? Specialty, string? Bio, string? Telegram, string? Instagram, string? Facebook);
public record CreateReadingMaterialRequest(string Title, string Content, string Topic, CefrLevel Level, int EstimatedMinutes, bool IsPublished, string? LanguageCode = "en");
public record CreateWritingMaterialRequest(string Title, string Instructions, string Topic, CefrLevel Level, int TargetWordCount, bool IsPublished, string? LanguageCode = "en");
public record CreateListeningMaterialRequest(string Title, string AudioUrl, string? Transcript, string Topic, CefrLevel Level, int EstimatedMinutes, bool IsPublished, string? LanguageCode = "en");
public record CreateVideoMaterialRequest(string Title, string VideoUrl, string? Description, string Topic, CefrLevel Level, int EstimatedMinutes, bool IsPublished, string? LanguageCode = "en");

public record AdminUpdateUserRoleRequest(UserRole Role, bool IsActive);
