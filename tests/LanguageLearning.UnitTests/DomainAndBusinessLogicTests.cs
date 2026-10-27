using FluentAssertions;
using LanguageLearning.Domain.Entities;
using LanguageLearning.Domain.Enums;
using LanguageLearning.Infrastructure.Services;
using Xunit;

namespace LanguageLearning.UnitTests;

public class VocabularyStateTransitionTests
{
    [Fact]
    public void NewWord_ShouldStartInPlannedState()
    {
        var entry = new PersonalVocabularyEntry
        {
            TargetWord = "diligent",
            NativeTranslation = "g'ayratli, tirishqoq",
            LanguageCode = "en"
        };

        entry.State.Should().Be(VocabularyState.Planned);
        entry.ConsecutiveCorrectCount.Should().Be(0);
        entry.VerifiedLearnedAtUtc.Should().BeNull();
    }

    [Fact]
    public void CorrectAttemptWithoutHint_IncrementsConsecutiveCount_AndMovesToInProgress()
    {
        var entry = new PersonalVocabularyEntry
        {
            TargetWord = "diligent",
            NativeTranslation = "g'ayratli",
            LanguageCode = "en"
        };

        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);

        entry.State.Should().Be(VocabularyState.InProgress);
        entry.ConsecutiveCorrectCount.Should().Be(1);
        entry.TotalAttempts.Should().Be(1);
        entry.SuccessfulAttempts.Should().Be(1);
        entry.HintAssistedAttempts.Should().Be(0);
    }

    [Fact]
    public void ThreeConsecutiveCorrectAnswersWithoutHint_PromotesToLearned()
    {
        var entry = new PersonalVocabularyEntry
        {
            TargetWord = "eloquent",
            NativeTranslation = "notiq, fasih",
            LanguageCode = "en"
        };

        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);
        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);
        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);

        entry.State.Should().Be(VocabularyState.Learned);
        entry.ConsecutiveCorrectCount.Should().Be(3);
        entry.VerifiedLearnedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void HintAssistedCorrectAnswer_DoesNotIncrementConsecutiveCount_DoesNotPromoteToLearned()
    {
        var entry = new PersonalVocabularyEntry
        {
            TargetWord = "ubiquitous",
            NativeTranslation = "hamma joyda hozir",
            LanguageCode = "en"
        };

        // Two independent correct answers
        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);
        entry.RecordPracticeAttempt(isCorrect: true, usedHint: false);
        entry.ConsecutiveCorrectCount.Should().Be(2);

        // Third answer was assisted by hint
        entry.RecordPracticeAttempt(isCorrect: true, usedHint: true);

        entry.ConsecutiveCorrectCount.Should().Be(2); // Unchanged!
        entry.HintAssistedAttempts.Should().Be(1);
        entry.State.Should().Be(VocabularyState.InProgress);
        entry.VerifiedLearnedAtUtc.Should().BeNull();
    }

    [Fact]
    public void IncorrectAnswerOnLearnedWord_ResetsConsecutiveCount_AndTransitionsToNeedsReview()
    {
        var entry = new PersonalVocabularyEntry
        {
            TargetWord = "eloquent",
            NativeTranslation = "notiq",
            LanguageCode = "en"
        };

        // Achieve learned state
        entry.RecordPracticeAttempt(true, false);
        entry.RecordPracticeAttempt(true, false);
        entry.RecordPracticeAttempt(true, false);
        entry.State.Should().Be(VocabularyState.Learned);

        // Failed attempt later
        entry.RecordPracticeAttempt(isCorrect: false, usedHint: false);

        entry.State.Should().Be(VocabularyState.NeedsReview);
        entry.ConsecutiveCorrectCount.Should().Be(0);
    }
}

public class PracticeSessionHintLimitTests
{
    [Fact]
    public void Session_AllowsUpToThreeHints_AndThrowsWhenExceeded()
    {
        var session = new PracticeSession
        {
            UserId = Guid.NewGuid(),
            TotalQuestions = 10
        };

        session.CanUseHint().Should().BeTrue();
        session.RecordHintUsage();
        session.HintsUsed.Should().Be(1);

        session.RecordHintUsage();
        session.HintsUsed.Should().Be(2);

        session.RecordHintUsage();
        session.HintsUsed.Should().Be(3);

        session.CanUseHint().Should().BeFalse();

        // 4th hint must throw InvalidOperationException
        var action = () => session.RecordHintUsage();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("*limit*reached*");
    }
}

public class PasswordHasherTests
{
    [Fact]
    public void PasswordHasher_HashesAndVerifiesCorrectly()
    {
        var hasher = new PasswordHasherService();
        var raw = "SecurePass123!";

        var hash = hasher.HashPassword(raw);
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(raw);

        hasher.VerifyPassword(raw, hash).Should().BeTrue();
        hasher.VerifyPassword("WrongPass!", hash).Should().BeFalse();
    }
}

