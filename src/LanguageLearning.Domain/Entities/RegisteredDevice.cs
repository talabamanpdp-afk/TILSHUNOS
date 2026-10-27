namespace LanguageLearning.Domain.Entities;

public class RegisteredDevice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public string DeviceName { get; set; } = string.Empty; // e.g. "Samsung Galaxy S24" or user custom name
    public string DeviceType { get; set; } = "Mobile"; // Mobile, Tablet, Desktop
    public string Platform { get; set; } = string.Empty; // Android, iOS, Windows, macOS, Linux
    public string Browser { get; set; } = string.Empty; // Chrome, Safari, Edge, Firefox
    public bool IsPwaInstalled { get; set; } = false;
    public string? InstallMethod { get; set; } // "beforeinstallprompt", "standalone-detected", "manual"
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime LastActiveAtUtc { get; set; } = DateTime.UtcNow;
    public bool IsRevoked { get; set; } = false;
}
