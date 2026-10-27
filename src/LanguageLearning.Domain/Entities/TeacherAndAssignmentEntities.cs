using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Domain.Entities;

public class TeacherProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string Bio { get; set; } = string.Empty;
    public string Qualifications { get; set; } = string.Empty;
    public string LanguagesTaught { get; set; } = "en"; // Comma separated: "en,de,tr"
    public string CefrLevelsTaught { get; set; } = "A1,A2,B1,B2,C1";
    public string? ExternalContactUrl { get; set; } // e.g., "https://t.me/teacher_username"
    public decimal? HourlyRate { get; set; }
    public int TeachingExperienceYears { get; set; } = 1;
    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<TeacherStudentConnection> StudentConnections { get; set; } = new List<TeacherStudentConnection>();
}

public class TeacherStudentConnection
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;
    public string? Notes { get; set; }
    public DateTime RequestedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAtUtc { get; set; }
}

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Instructions { get; set; } = string.Empty;
    public AssignmentType TaskType { get; set; } = AssignmentType.Vocabulary;
    public CefrLevel Level { get; set; } = CefrLevel.A1;
    public string LanguageCode { get; set; } = "en";

    public DateTime? DueDateUtc { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Assigned;
    public decimal MaxScore { get; set; } = 100;

    // Optional structured attachments (e.g., vocabulary word list or reading material reference)
    public string? AttachmentJson { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<AssignmentSubmission> Submissions { get; set; } = new List<AssignmentSubmission>();
}

public class AssignmentSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public string Content { get; set; } = string.Empty;
    public int Version { get; set; } = 1;
    public DateTime SubmittedAtUtc { get; set; } = DateTime.UtcNow;

    // Teacher Evaluation
    public decimal? TeacherGrade { get; set; }
    public string? TeacherFeedback { get; set; }
    public string? RubricCriteriaScoresJson { get; set; }
    public DateTime? GradedAtUtc { get; set; }
}

public class WritingDraft
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public WritingGenre Genre { get; set; } = WritingGenre.Essay;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int WordCount { get; set; } = 0;
    public int CharacterCount { get; set; } = 0;

    public string? AiFeedbackJson { get; set; }
    public bool IsSubmitted { get; set; } = false;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
