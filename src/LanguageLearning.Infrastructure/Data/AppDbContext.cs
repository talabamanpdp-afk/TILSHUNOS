using LanguageLearning.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LanguageLearning.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<UserLearningLanguage> UserLearningLanguages => Set<UserLearningLanguage>();
    public DbSet<RegisteredDevice> RegisteredDevices => Set<RegisteredDevice>();
    public DbSet<PersonalVocabularyEntry> PersonalVocabularyEntries => Set<PersonalVocabularyEntry>();
    public DbSet<PracticeSession> PracticeSessions => Set<PracticeSession>();
    public DbSet<PracticeAttempt> PracticeAttempts => Set<PracticeAttempt>();
    public DbSet<PublishedVocabularyCollection> PublishedVocabularyCollections => Set<PublishedVocabularyCollection>();
    public DbSet<PublishedVocabularyCollectionEntry> PublishedVocabularyCollectionEntries => Set<PublishedVocabularyCollectionEntry>();
    public DbSet<ContentGroup> ContentGroups => Set<ContentGroup>();
    public DbSet<LearningMaterial> LearningMaterials => Set<LearningMaterial>();
    public DbSet<MaterialProgress> MaterialProgressRecords => Set<MaterialProgress>();
    public DbSet<TeacherProfile> TeacherProfiles => Set<TeacherProfile>();
    public DbSet<TeacherStudentConnection> TeacherStudentConnections => Set<TeacherStudentConnection>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<AssignmentSubmission> AssignmentSubmissions => Set<AssignmentSubmission>();
    public DbSet<WritingDraft> WritingDrafts => Set<WritingDraft>();
    public DbSet<AIConversation> AIConversations => Set<AIConversation>();
    public DbSet<AIMessage> AIMessages => Set<AIMessage>();
    public DbSet<InAppNotification> InAppNotifications => Set<InAppNotification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<EmailVerificationCode> EmailVerificationCodes => Set<EmailVerificationCode>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.NormalizedEmail).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256).IsRequired();
            entity.Property(e => e.FirstName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.Profile)
                  .WithOne(p => p.User)
                  .HasForeignKey<UserProfile>(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TeacherProfile)
                  .WithOne(t => t.User)
                  .HasForeignKey<TeacherProfile>(t => t.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // UserProfile
        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.ToTable("user_profiles");
            entity.HasKey(e => e.UserId);
        });

        // UserLearningLanguage
        modelBuilder.Entity<UserLearningLanguage>(entity =>
        {
            entity.ToTable("user_learning_languages");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.LanguageCode });
        });

        // RegisteredDevice
        modelBuilder.Entity<RegisteredDevice>(entity =>
        {
            entity.ToTable("registered_devices");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
        });

        // PersonalVocabularyEntry
        modelBuilder.Entity<PersonalVocabularyEntry>(entity =>
        {
            entity.ToTable("personal_vocabulary_entries");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.LanguageCode, e.TargetWord }).IsUnique();
            entity.Property(e => e.TargetWord).HasMaxLength(150).IsRequired();
            entity.Property(e => e.NativeTranslation).HasMaxLength(250).IsRequired();
        });

        // PracticeSession
        modelBuilder.Entity<PracticeSession>(entity =>
        {
            entity.ToTable("practice_sessions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);

            entity.HasMany(e => e.Attempts)
                  .WithOne(a => a.Session)
                  .HasForeignKey(a => a.SessionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // PracticeAttempt
        modelBuilder.Entity<PracticeAttempt>(entity =>
        {
            entity.ToTable("practice_attempts");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.SessionId);
            entity.HasIndex(e => e.VocabularyEntryId);
        });

        // PublishedVocabularyCollection
        modelBuilder.Entity<PublishedVocabularyCollection>(entity =>
        {
            entity.ToTable("published_vocabulary_collections");
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.AuthorUser)
                  .WithMany()
                  .HasForeignKey(e => e.AuthorUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Entries)
                  .WithOne(entry => entry.Collection)
                  .HasForeignKey(entry => entry.CollectionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // PublishedVocabularyCollectionEntry
        modelBuilder.Entity<PublishedVocabularyCollectionEntry>(entity =>
        {
            entity.ToTable("published_vocabulary_collection_entries");
            entity.HasKey(e => e.Id);
        });

        // ContentGroup
        modelBuilder.Entity<ContentGroup>(entity =>
        {
            entity.ToTable("content_groups");
            entity.HasKey(e => e.Id);

            entity.HasMany(e => e.Versions)
                  .WithOne(m => m.ContentGroup)
                  .HasForeignKey(m => m.ContentGroupId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // LearningMaterial
        modelBuilder.Entity<LearningMaterial>(entity =>
        {
            entity.ToTable("learning_materials");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.ContentType, e.LanguageCode, e.Level });
        });

        // MaterialProgress
        modelBuilder.Entity<MaterialProgress>(entity =>
        {
            entity.ToTable("material_progress_records");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.MaterialId }).IsUnique();
        });

        // TeacherProfile
        modelBuilder.Entity<TeacherProfile>(entity =>
        {
            entity.ToTable("teacher_profiles");
            entity.HasKey(e => e.UserId);
        });

        // TeacherStudentConnection
        modelBuilder.Entity<TeacherStudentConnection>(entity =>
        {
            entity.ToTable("teacher_student_connections");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.TeacherId, e.StudentId }).IsUnique();

            entity.HasOne(e => e.Teacher)
                  .WithMany()
                  .HasForeignKey(e => e.TeacherId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Student)
                  .WithMany()
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Assignment
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.ToTable("assignments");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StudentId);
            entity.HasIndex(e => e.TeacherId);

            entity.HasOne(e => e.Teacher)
                  .WithMany()
                  .HasForeignKey(e => e.TeacherId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Student)
                  .WithMany()
                  .HasForeignKey(e => e.StudentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Submissions)
                  .WithOne(s => s.Assignment)
                  .HasForeignKey(s => s.AssignmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // AssignmentSubmission
        modelBuilder.Entity<AssignmentSubmission>(entity =>
        {
            entity.ToTable("assignment_submissions");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.AssignmentId);
        });

        // WritingDraft
        modelBuilder.Entity<WritingDraft>(entity =>
        {
            entity.ToTable("writing_drafts");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
        });

        // AIConversation & AIMessage
        modelBuilder.Entity<AIConversation>(entity =>
        {
            entity.ToTable("ai_conversations");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);

            entity.HasMany(e => e.Messages)
                  .WithOne(m => m.Conversation)
                  .HasForeignKey(m => m.ConversationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AIMessage>(entity =>
        {
            entity.ToTable("ai_messages");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ConversationId);
        });

        // InAppNotification
        modelBuilder.Entity<InAppNotification>(entity =>
        {
            entity.ToTable("in_app_notifications");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.UserId, e.IsRead });
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("audit_logs");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TimestampUtc);
        });

        // EmailVerificationCode
        modelBuilder.Entity<EmailVerificationCode>(entity =>
        {
            entity.ToTable("email_verification_codes");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.Email, e.Code });
        });

        // PasswordResetToken
        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.ToTable("password_reset_tokens");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
        });
    }
}
