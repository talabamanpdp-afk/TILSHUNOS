using System.Security.Cryptography;
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
[Route("api/v1/vocabulary")]
public class VocabularyController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public VocabularyController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetVocabulary(
        [FromQuery] string? languageCode,
        [FromQuery] VocabularyState? state,
        [FromQuery] string? search,
        [FromQuery] string? topic)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var query = _db.PersonalVocabularyEntries.Where(v => v.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            query = query.Where(v => v.LanguageCode == languageCode);
        }

        if (state.HasValue)
        {
            query = query.Where(v => v.State == state.Value);
        }

        if (!string.IsNullOrWhiteSpace(topic))
        {
            query = query.Where(v => v.Topic == topic);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(v => v.TargetWord.ToLower().Contains(term) || v.NativeTranslation.ToLower().Contains(term));
        }

        var list = await query
            .OrderByDescending(v => v.CreatedAtUtc)
            .Select(v => new VocabularyEntryDto(
                v.Id,
                v.LanguageCode,
                v.TargetWord,
                v.NativeTranslation,
                v.ExampleSentence,
                v.Hint,
                v.PersonalNote,
                v.Topic,
                v.PartOfSpeech,
                v.Phonetic,
                v.State,
                v.ConsecutiveCorrectCount,
                v.TotalAttempts,
                v.SuccessfulAttempts,
                v.LastAttemptAtUtc,
                v.VerifiedLearnedAtUtc,
                v.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEntry([FromBody] CreateVocabularyEntryRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var targetWord = request.TargetWord.Trim();
        var lang = request.LanguageCode.Trim().ToLowerInvariant();

        var existing = await _db.PersonalVocabularyEntries
            .FirstOrDefaultAsync(v => v.UserId == userId.Value && v.LanguageCode == lang && v.TargetWord.ToLower() == targetWord.ToLower());

        if (existing != null)
        {
            return BadRequest(new { message = $"'{targetWord}' is already in your vocabulary notebook." });
        }

        var entry = new PersonalVocabularyEntry
        {
            UserId = userId.Value,
            LanguageCode = lang,
            TargetWord = targetWord,
            NativeTranslation = request.NativeTranslation.Trim(),
            ExampleSentence = request.ExampleSentence?.Trim(),
            Hint = request.Hint?.Trim(),
            PersonalNote = request.PersonalNote?.Trim(),
            Topic = request.Topic?.Trim() ?? "General",
            PartOfSpeech = request.PartOfSpeech?.Trim(),
            Phonetic = request.Phonetic?.Trim(),
            State = VocabularyState.Planned, // Always starts in Planned, cannot be marked as learned directly
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.PersonalVocabularyEntries.Add(entry);
        await _db.SaveChangesAsync();

        var dto = new VocabularyEntryDto(
            entry.Id, entry.LanguageCode, entry.TargetWord, entry.NativeTranslation, entry.ExampleSentence,
            entry.Hint, entry.PersonalNote, entry.Topic, entry.PartOfSpeech, entry.Phonetic, entry.State,
            entry.ConsecutiveCorrectCount, entry.TotalAttempts, entry.SuccessfulAttempts,
            entry.LastAttemptAtUtc, entry.VerifiedLearnedAtUtc, entry.CreatedAtUtc);

        return Ok(dto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateVocabularyEntryRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var entry = await _db.PersonalVocabularyEntries.FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId.Value);
        if (entry == null) return NotFound(new { message = "Entry not found." });

        entry.TargetWord = request.TargetWord.Trim();
        entry.NativeTranslation = request.NativeTranslation.Trim();
        entry.ExampleSentence = request.ExampleSentence?.Trim();
        entry.Hint = request.Hint?.Trim();
        entry.PersonalNote = request.PersonalNote?.Trim();
        entry.Topic = request.Topic?.Trim();
        entry.PartOfSpeech = request.PartOfSpeech?.Trim();
        entry.Phonetic = request.Phonetic?.Trim();

        await _db.SaveChangesAsync();
        return Ok(new { message = "Entry updated successfully." });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteEntry(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var entry = await _db.PersonalVocabularyEntries.FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId.Value);
        if (entry == null) return NotFound(new { message = "Entry not found." });

        _db.PersonalVocabularyEntries.Remove(entry);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Entry deleted successfully." });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetVocabularyStats([FromQuery] string? languageCode)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var query = _db.PersonalVocabularyEntries.Where(v => v.UserId == userId.Value);
        if (!string.IsNullOrWhiteSpace(languageCode))
        {
            query = query.Where(v => v.LanguageCode == languageCode);
        }

        var entries = await query.ToListAsync();

        var planned = entries.Count(e => e.State == VocabularyState.Planned);
        var inProgress = entries.Count(e => e.State == VocabularyState.InProgress);
        var learned = entries.Count(e => e.State == VocabularyState.Learned);
        var needsReview = entries.Count(e => e.State == VocabularyState.NeedsReview);
        var archived = entries.Count(e => e.State == VocabularyState.Archived);

        var totalAttempts = entries.Sum(e => e.TotalAttempts);
        var successful = entries.Sum(e => e.SuccessfulAttempts);
        var accuracy = totalAttempts > 0 ? (int)Math.Round((double)successful / totalAttempts * 100) : 0;

        return Ok(new VocabularyStatsDto(planned, inProgress, learned, needsReview, archived, accuracy));
    }

    // --- Public Notebooks ---
    [AllowAnonymous]
    [HttpGet("collections/public")]
    public async Task<IActionResult> GetPublicCollections(
        [FromQuery] string? targetLanguage,
        [FromQuery] CefrLevel? level,
        [FromQuery] string? topic)
    {
        var query = _db.PublishedVocabularyCollections
            .Include(c => c.AuthorUser)
            .Include(c => c.Entries)
            .Where(c => c.IsPublished);

        if (!string.IsNullOrWhiteSpace(targetLanguage)) query = query.Where(c => c.TargetLanguage == targetLanguage);
        if (level.HasValue) query = query.Where(c => c.Level == level.Value);
        if (!string.IsNullOrWhiteSpace(topic)) query = query.Where(c => c.Topic == topic);

        var collections = await query
            .OrderByDescending(c => c.CopyCount)
            .Select(c => new PublishedCollectionDto(
                c.Id,
                c.Title,
                c.Description,
                c.TargetLanguage,
                c.Level,
                c.Topic,
                $"{c.AuthorUser.FirstName} {c.AuthorUser.LastName}",
                c.Entries.Count,
                c.CopyCount,
                c.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(collections);
    }

    [HttpPost("collections/publish")]
    public async Task<IActionResult> PublishCollection([FromBody] CreatePublicCollectionRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var collection = new PublishedVocabularyCollection
        {
            AuthorUserId = userId.Value,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            TargetLanguage = request.TargetLanguage,
            Level = request.Level,
            Topic = request.Topic,
            IsPublished = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        foreach (var entryItem in request.Entries)
        {
            collection.Entries.Add(new PublishedVocabularyCollectionEntry
            {
                TargetWord = entryItem.TargetWord.Trim(),
                NativeTranslation = entryItem.NativeTranslation.Trim(),
                ExampleSentence = entryItem.ExampleSentence?.Trim(),
                PartOfSpeech = entryItem.PartOfSpeech?.Trim(),
                Topic = entryItem.Topic?.Trim()
            });
        }

        _db.PublishedVocabularyCollections.Add(collection);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Vocabulary collection published successfully." });
    }

    [HttpPost("collections/{id:guid}/copy")]
    public async Task<IActionResult> CopyCollectionToPlanned(Guid id)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var collection = await _db.PublishedVocabularyCollections
            .Include(c => c.Entries)
            .FirstOrDefaultAsync(c => c.Id == id && c.IsPublished);

        if (collection == null) return NotFound(new { message = "Collection not found." });

        int copiedCount = 0;
        foreach (var entry in collection.Entries)
        {
            var alreadyExists = await _db.PersonalVocabularyEntries
                .AnyAsync(v => v.UserId == userId.Value && v.LanguageCode == collection.TargetLanguage && v.TargetWord.ToLower() == entry.TargetWord.ToLower());

            if (!alreadyExists)
            {
                _db.PersonalVocabularyEntries.Add(new PersonalVocabularyEntry
                {
                    UserId = userId.Value,
                    LanguageCode = collection.TargetLanguage,
                    TargetWord = entry.TargetWord,
                    NativeTranslation = entry.NativeTranslation,
                    ExampleSentence = entry.ExampleSentence,
                    PartOfSpeech = entry.PartOfSpeech,
                    Topic = entry.Topic ?? collection.Topic,
                    State = VocabularyState.Planned, // Anti-cheat rule: copied words are strictly Planned!
                    SourcePublicCollectionEntryId = entry.Id
                });
                copiedCount++;
            }
        }

        collection.CopyCount++;
        await _db.SaveChangesAsync();

        return Ok(new { message = $"{copiedCount} words added to your Planned list.", copiedCount });
    }
}

[Authorize]
[ApiController]
[Route("api/v1/practice")]
public class PracticeController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public PracticeController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartSession([FromBody] StartPracticeSessionRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var query = _db.PersonalVocabularyEntries
            .Where(v => v.UserId == userId.Value && v.LanguageCode == request.LanguageCode && v.State != VocabularyState.Archived);

        if (!request.IncludeLearnedWords)
        {
            query = query.Where(v => v.State == VocabularyState.Planned || v.State == VocabularyState.InProgress || v.State == VocabularyState.NeedsReview);
        }

        if (!string.IsNullOrWhiteSpace(request.TopicFilter))
        {
            query = query.Where(v => v.Topic == request.TopicFilter);
        }

        var eligibleWords = await query.ToListAsync();
        if (eligibleWords.Count == 0)
        {
            return BadRequest(new { message = "No eligible words found for practice. Add some words to your notebook first!" });
        }

        // Randomize word order using Fisher-Yates shuffle
        var randomList = eligibleWords.OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue)).Take(request.SessionSize).ToList();

        var session = new PracticeSession
        {
            UserId = userId.Value,
            LanguageCode = request.LanguageCode,
            Direction = request.Direction,
            TotalQuestions = randomList.Count,
            HintsUsed = 0,
            IsCompleted = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.PracticeSessions.Add(session);
        await _db.SaveChangesAsync();

        var questions = new List<PracticeQuestionDto>();
        for (int i = 0; i < randomList.Count; i++)
        {
            var word = randomList[i];
            var direction = request.Direction;
            if (direction == PracticeDirection.Mixed)
            {
                direction = RandomNumberGenerator.GetInt32(2) == 0 ? PracticeDirection.TargetToNative : PracticeDirection.NativeToTarget;
            }

            var prompt = direction == PracticeDirection.TargetToNative ? word.TargetWord : word.NativeTranslation;
            var promptNote = direction == PracticeDirection.TargetToNative ? "Enter Native Translation" : "Enter Target Word";

            questions.Add(new PracticeQuestionDto(
                word.Id,
                prompt,
                promptNote,
                word.PartOfSpeech,
                word.Topic,
                !string.IsNullOrWhiteSpace(word.Hint)
            ));
        }

        var responseDto = new PracticeSessionDto(
            session.Id,
            session.Direction,
            session.TotalQuestions,
            PracticeSession.MaxHintsAllowedPerSession - session.HintsUsed,
            questions
        );

        return Ok(responseDto);
    }

    [HttpPost("hint/{sessionId:guid}")]
    public async Task<IActionResult> RequestHint(Guid sessionId, [FromQuery] Guid entryId)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var session = await _db.PracticeSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId.Value);
        if (session == null || session.IsCompleted) return NotFound(new { message = "Active practice session not found." });

        if (!session.CanUseHint())
        {
            return BadRequest(new { message = "You have used all 3 hints allowed for this practice session." });
        }

        var entry = await _db.PersonalVocabularyEntries.FirstOrDefaultAsync(e => e.Id == entryId && e.UserId == userId.Value);
        if (entry == null) return NotFound(new { message = "Vocabulary word not found." });

        session.RecordHintUsage();
        await _db.SaveChangesAsync();

        var hintText = !string.IsNullOrWhiteSpace(entry.Hint) 
            ? entry.Hint 
            : $"Word starts with '{entry.TargetWord.Substring(0, Math.Min(2, entry.TargetWord.Length))}'...";

        return Ok(new
        {
            Hint = hintText,
            HintsRemaining = PracticeSession.MaxHintsAllowedPerSession - session.HintsUsed
        });
    }

    [HttpPost("answer")]
    public async Task<IActionResult> SubmitAnswer([FromBody] SubmitPracticeAnswerRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var session = await _db.PracticeSessions.FirstOrDefaultAsync(s => s.Id == request.SessionId && s.UserId == userId.Value);
        if (session == null || session.IsCompleted)
        {
            return BadRequest(new { message = "Practice session is invalid or already finished." });
        }

        var entry = await _db.PersonalVocabularyEntries.FirstOrDefaultAsync(e => e.Id == request.EntryId && e.UserId == userId.Value);
        if (entry == null) return NotFound(new { message = "Vocabulary word not found." });

        // Normalize text
        var submitted = request.SubmittedAnswer.Trim().ToLowerInvariant();
        var targetWordNorm = entry.TargetWord.Trim().ToLowerInvariant();
        var nativeTransNorm = entry.NativeTranslation.Trim().ToLowerInvariant();

        // Target answer can match target or native translation based on question prompt
        bool isCorrect = submitted == targetWordNorm || submitted == nativeTransNorm;

        // Apply domain anti-cheat rules
        entry.RecordPracticeAttempt(isCorrect, request.UsedHint);

        if (isCorrect)
        {
            session.CorrectCount++;
        }

        // Record attempt
        var attempt = new PracticeAttempt
        {
            SessionId = session.Id,
            VocabularyEntryId = entry.Id,
            Direction = session.Direction,
            SubmittedAnswer = request.SubmittedAnswer.Trim(),
            IsCorrect = isCorrect,
            HintUsed = request.UsedHint,
            AttemptedAtUtc = DateTime.UtcNow
        };
        _db.PracticeAttempts.Add(attempt);

        await _db.SaveChangesAsync();

        var resultDto = new PracticeAttemptResultDto(
            isCorrect,
            request.SubmittedAnswer,
            entry.TargetWord + " = " + entry.NativeTranslation,
            entry.ExampleSentence,
            entry.ConsecutiveCorrectCount,
            entry.State,
            PracticeSession.MaxHintsAllowedPerSession - session.HintsUsed
        );

        return Ok(resultDto);
    }

    [HttpPost("finish/{sessionId:guid}")]
    public async Task<IActionResult> FinishSession(Guid sessionId)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var session = await _db.PracticeSessions
            .Include(s => s.Attempts)
            .ThenInclude(a => a.VocabularyEntry)
            .FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId.Value);

        if (session == null) return NotFound();

        session.IsCompleted = true;
        session.CompletedAtUtc = DateTime.UtcNow;

        // Update user profile streak if today is active
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId.Value);
        if (profile != null)
        {
            var now = DateTime.UtcNow.Date;
            if (profile.LastActiveDateUtc?.Date != now)
            {
                if (profile.LastActiveDateUtc?.Date == now.AddDays(-1))
                {
                    profile.CurrentStreakDays++;
                }
                else
                {
                    profile.CurrentStreakDays = 1;
                }
                profile.LastActiveDateUtc = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();

        var promotedWords = session.Attempts
            .Where(a => a.VocabularyEntry.State == VocabularyState.Learned && a.VocabularyEntry.VerifiedLearnedAtUtc >= session.CreatedAtUtc)
            .Select(a => a.VocabularyEntry)
            .DistinctBy(e => e.Id)
            .Select(v => new VocabularyEntryDto(
                v.Id, v.LanguageCode, v.TargetWord, v.NativeTranslation, v.ExampleSentence, v.Hint, v.PersonalNote,
                v.Topic, v.PartOfSpeech, v.Phonetic, v.State, v.ConsecutiveCorrectCount, v.TotalAttempts,
                v.SuccessfulAttempts, v.LastAttemptAtUtc, v.VerifiedLearnedAtUtc, v.CreatedAtUtc))
            .ToList();

        var needsReviewWords = session.Attempts
            .Where(a => !a.IsCorrect)
            .Select(a => a.VocabularyEntry)
            .DistinctBy(e => e.Id)
            .Select(v => new VocabularyEntryDto(
                v.Id, v.LanguageCode, v.TargetWord, v.NativeTranslation, v.ExampleSentence, v.Hint, v.PersonalNote,
                v.Topic, v.PartOfSpeech, v.Phonetic, v.State, v.ConsecutiveCorrectCount, v.TotalAttempts,
                v.SuccessfulAttempts, v.LastAttemptAtUtc, v.VerifiedLearnedAtUtc, v.CreatedAtUtc))
            .ToList();

        int accuracy = session.TotalQuestions > 0 ? (int)Math.Round((double)session.CorrectCount / session.TotalQuestions * 100) : 0;

        var summary = new PracticeSessionSummaryDto(
            session.Id,
            session.TotalQuestions,
            session.CorrectCount,
            session.TotalQuestions - session.CorrectCount,
            accuracy,
            session.HintsUsed,
            promotedWords,
            needsReviewWords
        );

        return Ok(summary);
    }
}
