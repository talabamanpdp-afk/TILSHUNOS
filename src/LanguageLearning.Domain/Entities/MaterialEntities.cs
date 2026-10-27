using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Domain.Entities;

public class ContentGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public MaterialContentType ContentType { get; set; } = MaterialContentType.Story;
    public string LanguageCode { get; set; } = "en";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<LearningMaterial> Versions { get; set; } = new List<LearningMaterial>();
}

public class LearningMaterial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ContentGroupId { get; set; }
    public ContentGroup? ContentGroup { get; set; }

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public MaterialContentType ContentType { get; set; } = MaterialContentType.Story;
    public CefrLevel Level { get; set; } = CefrLevel.A1;
    public string LanguageCode { get; set; } = "en";
    
    public string ContentBody { get; set; } = string.Empty; // Markdown/HTML story, news text, or grammar explanation
    public string? AudioUrl { get; set; }
    public string? VideoUrl { get; set; } // YouTube embed URL or storage URL
    public string? SourceUrl { get; set; }
    public string? Attribution { get; set; }
    public int EstimatedMinutes { get; set; } = 5;

    // Structured JSON for embedded exercises & vocabulary hints
    public string? VocabularyListJson { get; set; }
    public string? ComprehensionQuestionsJson { get; set; }

    public bool IsPublished { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<MaterialProgress> ProgressRecords { get; set; } = new List<MaterialProgress>();
}

public class MaterialProgress
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid MaterialId { get; set; }
    public LearningMaterial Material { get; set; } = null!;

    public bool IsCompleted { get; set; } = false;
    public int Score { get; set; } = 0;
    public int ProgressPercentage { get; set; } = 0;
    public DateTime LastAccessedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }
}
