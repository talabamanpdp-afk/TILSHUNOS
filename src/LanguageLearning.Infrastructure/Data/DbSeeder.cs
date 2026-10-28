using System.Security.Cryptography;
using LanguageLearning.Application.Interfaces;
using LanguageLearning.Domain.Entities;
using LanguageLearning.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace LanguageLearning.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordHasherService passwordHasher, ILogger logger)
    {
        try
        {
            var creator = db.Database.GetService<IDatabaseCreator>() as IRelationalDatabaseCreator;
            if (creator != null)
            {
                await creator.CreateTablesAsync();
                logger.LogInformation("Database tables created successfully.");
            }
        }
        catch (Exception ex)
        {
            logger.LogInformation("Database tables already exist or created: {Message}", ex.Message);
        }

        // 1. Super Admin: Soxibjon Gaybullayev
        var mainAdminEmail = "soxibgaybullayev439@gmail.com";
        var normMainAdmin = mainAdminEmail.ToUpperInvariant();
        var existingMainAdmin = await db.Users.Include(u => u.Profile).FirstOrDefaultAsync(u => u.NormalizedEmail == normMainAdmin);
        if (existingMainAdmin == null)
        {
            var admin = new User
            {
                Email = mainAdminEmail,
                NormalizedEmail = normMainAdmin,
                FirstName = "Soxibjon",
                LastName = "Gaybullayev",
                PasswordHash = passwordHasher.HashPassword("s0x1bj0n$02$"),
                Role = UserRole.SuperAdmin,
                EmailConfirmed = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            var adminProfile = new UserProfile
            {
                UserId = admin.Id,
                NativeLanguage = "uz",
                Bio = "TILSHUNOS Platform Bosh Boshqaruvchisi (Super Admin)",
                DailyGoalMinutes = 60,
                IsPublic = true
            };
            db.Users.Add(admin);
            db.UserProfiles.Add(adminProfile);
            logger.LogInformation("Seeded SuperAdmin: {Email}", mainAdminEmail);
        }
        else
        {
            existingMainAdmin.Role = UserRole.SuperAdmin;
            existingMainAdmin.EmailConfirmed = true;
            existingMainAdmin.PasswordHash = passwordHasher.HashPassword("s0x1bj0n$02$");
        }

        // Only ONE SuperAdmin: soxibgaybullayev439@gmail.com. No other demo or fallback admins are seeded.

        // 4. Seed Level-adapted Educational Content (Stories & News with A1, A2, B1 versions)
        if (!await db.ContentGroups.AnyAsync())
        {
            var storyGroup = new ContentGroup
            {
                Title = "The Mystery of the Old Silk Road",
                ContentType = MaterialContentType.Story,
                LanguageCode = "en"
            };
            db.ContentGroups.Add(storyGroup);

            // A1 Version
            db.LearningMaterials.Add(new LearningMaterial
            {
                ContentGroup = storyGroup,
                Title = "The Mystery of the Old Silk Road (A1 Beginner)",
                Description = "A simple story about an ancient trade city with basic vocabulary.",
                ContentType = MaterialContentType.Story,
                Level = CefrLevel.A1,
                LanguageCode = "en",
                EstimatedMinutes = 4,
                ContentBody = @"Samarkand is an old city in Central Asia. Long ago, people traveled on horses and camels. They sold silk, paper, and spices.

A young boy named Timur walked into the blue market. He saw many colorful plates and carpets. An old merchant smiled and gave him a small copper coin. 'Keep this safe,' the man said. 'It is a symbol of friendship.'",
                Attribution = "Tilshunos Original Educational Team"
            });

            // B1 Version
            db.LearningMaterials.Add(new LearningMaterial
            {
                ContentGroup = storyGroup,
                Title = "The Mystery of the Old Silk Road (B1 Intermediate)",
                Description = "Explore the cultural crossroads of Samarkand with rich descriptive grammar.",
                ContentType = MaterialContentType.Story,
                Level = CefrLevel.B1,
                LanguageCode = "en",
                EstimatedMinutes = 6,
                ContentBody = @"For centuries, Samarkand stood as the majestic jewel along the legendary Silk Road. Caravans laden with delicate Chinese silk, fragrant Persian spices, and Venetian glassware converged within its bustling bazaars.

While navigating through the labyrinthine streets surrounding the Registan, sixteen-year-old Timur stumbled upon an ancient workshop. The artisan was meticulously carving intricate floral patterns into walnut timber. Recognizing the curious gleam in the young traveler's eyes, the master craftsman revealed an ancient astrolabe crafted during the golden age of astronomy.",
                Attribution = "Tilshunos Original Educational Team"
            });

            // Listening Video Material with permitted YouTube player
            db.LearningMaterials.Add(new LearningMaterial
            {
                Title = "English Conversation Practice — Ordering at a Cafe",
                Description = "Master natural phrases for ordering coffee, pastries, and asking for the bill.",
                ContentType = MaterialContentType.VideoLesson,
                Level = CefrLevel.A2,
                LanguageCode = "en",
                EstimatedMinutes = 7,
                VideoUrl = "https://www.youtube.com/embed/g-fn8pS1L-Q",
                ContentBody = @"In this listening exercise, listen attentively to the dialogue between the customer and the barista. Pay close attention to polite requests using 'Could I please get...' and 'Would you mind if...'.",
                ComprehensionQuestionsJson = @"[
                    {""question"": ""What drink did the customer order?"", ""options"": [""Cappuccino"", ""Green Tea"", ""Hot Chocolate""], ""correctIndex"": 0},
                    {""question"": ""Did the customer pay with card or cash?"", ""options"": [""Card"", ""Cash"", ""Mobile Pay""], ""correctIndex"": 0}
                ]"
            });

            // Speaking Community & Practice Topic
            db.LearningMaterials.Add(new LearningMaterial
            {
                Title = "Daily Habits & Modern Routine — Speaking Room",
                Description = "Shadowing and speaking practice: Discussing morning routines and productivity.",
                ContentType = MaterialContentType.SpeakingTopic,
                Level = CefrLevel.B1,
                LanguageCode = "en",
                EstimatedMinutes = 10,
                SourceUrl = "https://t.me/tilshunos_speaking_club",
                ContentBody = @"Practice questions for your speaking partner or community chat:
1. Describe your typical morning routine from the moment you wake up.
2. How do you maintain focus while studying a new language?
3. What is one habit you recently started that changed your daily life?",
                Attribution = "Tilshunos Community Club"
            });

            // Grammar Lesson
            db.LearningMaterials.Add(new LearningMaterial
            {
                Title = "Present Perfect vs. Past Simple: The Definitive Guide",
                Description = "Understand when an action connects to the present moment versus a finished past timeframe.",
                ContentType = MaterialContentType.GrammarLesson,
                Level = CefrLevel.B1,
                LanguageCode = "en",
                EstimatedMinutes = 8,
                ContentBody = @"### 1. The Core Distinction
- **Past Simple** is used when the time period is finished and explicitly stated or understood:
  * *I visited Bukhara in 2023.* (Finished year)
- **Present Perfect** is used when the action has relevance to the present, or in an unfinished time period:
  * *I have visited Bukhara three times.* (In my life so far, life continues!)

### Common Time Indicators
- Past Simple: *yesterday, last week, ago, in 1999*
- Present Perfect: *already, yet, ever, never, recently, so far*",
                Attribution = "Tilshunos Grammar Department"
            });
        }

        // 5. Seed Public Vocabulary Collection
        await db.SaveChangesAsync();
        if (!await db.PublishedVocabularyCollections.AnyAsync())
        {
            var adminUser = await db.Users.FirstAsync(u => u.NormalizedEmail == normMainAdmin);
            var publicCol = new PublishedVocabularyCollection
            {
                AuthorUserId = adminUser.Id,
                Title = "Essential 50 Tech & Digital Vocabulary",
                Description = "Key terminology for software development, AI, data science, and modern digital business.",
                TargetLanguage = "en",
                Level = CefrLevel.B1,
                Topic = "Technology",
                IsPublished = true,
                CopyCount = 14,
                CreatedAtUtc = DateTime.UtcNow
            };
            publicCol.Entries.Add(new PublishedVocabularyCollectionEntry
            {
                TargetWord = "algorithm",
                NativeTranslation = "algoritm, hisoblash tartibi",
                ExampleSentence = "The search algorithm ranks results based on relevance.",
                PartOfSpeech = "Noun",
                Topic = "Technology"
            });
            publicCol.Entries.Add(new PublishedVocabularyCollectionEntry
            {
                TargetWord = "scalable",
                NativeTranslation = "kengaytiriladigan, miqyoslanadigan",
                ExampleSentence = "Cloud architectures are designed to be scalable under heavy loads.",
                PartOfSpeech = "Adjective",
                Topic = "Technology"
            });
            publicCol.Entries.Add(new PublishedVocabularyCollectionEntry
            {
                TargetWord = "debugging",
                NativeTranslation = "xatolarni topish va tuzatish",
                ExampleSentence = "He spent three hours debugging the asynchronous query.",
                PartOfSpeech = "Noun",
                Topic = "Technology"
            });
            db.PublishedVocabularyCollections.Add(publicCol);
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Database seed finished successfully.");
    }
}
