using LanguageLearning.Domain.Entities;
using LanguageLearning.Domain.Enums;

namespace LanguageLearning.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

public interface IPasswordHasherService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface IEmailService
{
    Task<bool> SendVerificationEmailAsync(string email, string code, CancellationToken cancellationToken = default);
    Task<bool> SendPasswordResetEmailAsync(string email, string token, CancellationToken cancellationToken = default);
    Task<bool> SendNotificationEmailAsync(string email, string subject, string htmlContent, CancellationToken cancellationToken = default);
}

public interface IAiAssistantService
{
    Task<string> GetChatResponseAsync(string systemPrompt, string userPrompt, string? conversationHistoryJson = null, CancellationToken cancellationToken = default);
    Task<string> AnalyzeWritingAsync(string text, string genre, string targetLanguage, CefrLevel level, CancellationToken cancellationToken = default);
    Task<string> ExplainWordAsync(string word, string targetLanguage, string nativeLanguage, CancellationToken cancellationToken = default);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    UserRole? Role { get; }
}
