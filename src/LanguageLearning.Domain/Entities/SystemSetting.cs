namespace LanguageLearning.Domain.Entities;

public class SystemSetting
{
    public string Key { get; set; } = string.Empty;
    public string ValueJson { get; set; } = string.Empty;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
