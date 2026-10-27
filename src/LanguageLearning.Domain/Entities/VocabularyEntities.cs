using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Domain.Entities;

public class PersonalVocabularyEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string LanguageCode { get; set; } = "en";
    public string TargetWord { get; set; } = string.Empty;
    public string NativeTranslation { get; set; } = string.Empty;
    public string? ExampleSentence { get; set; }
    public string? Hint { get; set; }
    public string? PersonalNote { get; set; }
    public string? Topic { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? Phonetic { get; set; }

    public VocabularyState State { get; set; } = VocabularyState.Planned;
    
    // Anti-fraud verification tracking
    public int ConsecutiveCorrectCount { get; set; } = 0;
    public int TotalAttempts { get; set; } = 0;
    public int SuccessfulAttempts { get; set; } = 0;
    public int HintAssistedAttempts { get; set; } = 0;
    public DateTime? LastAttemptAtUtc { get; set; }
    public DateTime? VerifiedLearnedAtUtc { get; set; }
    
    // Copy provenance
    public Guid? SourcePublicCollectionEntryId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public const int RequiredConsecutiveCorrectForLearned = 3;

    public void RecordPracticeAttempt(bool isCorrect, bool usedHint)
    {
        TotalAttempts++;
        LastAttemptAtUtc = DateTime.UtcNow;

        if (State == VocabularyState.Planned)
        {
            State = VocabularyState.InProgress;
        }

        if (isCorrect)
        {
            SuccessfulAttempts++;
            if (usedHint)
            {
                HintAssistedAttempts++;
                // Hint-assisted correct answer does NOT count towards verified learned criteria
            }
            else
            {
                ConsecutiveCorrectCount++;
                if (ConsecutiveCorrectCount >= RequiredConsecutiveCorrectForLearned && State != VocabularyState.Learned)
                {
                    State = VocabularyState.Learned;
                    VerifiedLearnedAtUtc = DateTime.UtcNow;
                }
            }
        }
        else
        {
            ConsecutiveCorrectCount = 0;
            // If it was already learned and answered incorrectly, move to NeedsReview
            if (State == VocabularyState.Learned)
            {
                State = VocabularyState.NeedsReview;
            }
        }
    }
}

public class PracticeSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string LanguageCode { get; set; } = "en";
    public PracticeDirection Direction { get; set; } = PracticeDirection.TargetToNative;
    public int TotalQuestions { get; set; } = 0;
    public int CorrectCount { get; set; } = 0;
    public int HintsUsed { get; set; } = 0;
    public const int MaxHintsAllowedPerSession = 3;

    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }

    public ICollection<PracticeAttempt> Attempts { get; set; } = new List<PracticeAttempt>();

    public bool CanUseHint() => HintsUsed < MaxHintsAllowedPerSession;

    public void RecordHintUsage()
    {
        if (!CanUseHint())
        {
            throw new InvalidOperationException($"Hint limit of {MaxHintsAllowedPerSession} per session reached.");
        }
        HintsUsed++;
    }
}

public class PracticeAttempt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public PracticeSession Session { get; set; } = null!;

    public Guid VocabularyEntryId { get; set; }
    public PersonalVocabularyEntry VocabularyEntry { get; set; } = null!;

    public PracticeDirection Direction { get; set; }
    public string SubmittedAnswer { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public bool HintUsed { get; set; }
    public DateTime AttemptedAtUtc { get; set; } = DateTime.UtcNow;
}

public class PublishedVocabularyCollection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AuthorUserId { get; set; }
    public User AuthorUser { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TargetLanguage { get; set; } = "en";
    public CefrLevel Level { get; set; } = CefrLevel.A1;
    public string Topic { get; set; } = "General";
    public bool IsPublished { get; set; } = false;
    public int CopyCount { get; set; } = 0;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<PublishedVocabularyCollectionEntry> Entries { get; set; } = new List<PublishedVocabularyCollectionEntry>();
}

public class PublishedVocabularyCollectionEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CollectionId { get; set; }
    public PublishedVocabularyCollection Collection { get; set; } = null!;

    public string TargetWord { get; set; } = string.Empty;
    public string NativeTranslation { get; set; } = string.Empty;
    public string? ExampleSentence { get; set; }
    public string? PartOfSpeech { get; set; }
    public string? Phonetic { get; set; }
    public string? Topic { get; set; }
}
