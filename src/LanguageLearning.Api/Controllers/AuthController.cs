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

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtTokenService _jwtService;
    private readonly IEmailService _emailService;
    private readonly ICurrentUserService _currentUserService;

    public AuthController(
        AppDbContext db,
        IPasswordHasherService passwordHasher,
        IJwtTokenService jwtService,
        IEmailService emailService,
        ICurrentUserService currentUserService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _emailService = emailService;
        _currentUserService = currentUserService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        if (await _db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
        {
            return BadRequest(new { message = "Ushbu email bilan allaqachon ro‘yxatdan o‘tilgan. Iltimos, hisobingizga kiring." });
        }

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            NormalizedEmail = normalizedEmail,
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = UserRole.Learner,
            EmailConfirmed = false
        };

        var profile = new UserProfile
        {
            UserId = user.Id,
            NativeLanguage = "uz",
            DailyGoalMinutes = 20,
            IsPublic = true
        };

        _db.Users.Add(user);
        _db.UserProfiles.Add(profile);

        // Generate 6-digit verification code
        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var verification = new EmailVerificationCode
        {
            Email = user.Email,
            Code = code,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(15)
        };
        _db.EmailVerificationCodes.Add(verification);

        await _db.SaveChangesAsync();

        // Send verification email via Resend
        try
        {
            await _emailService.SendVerificationEmailAsync(user.Email, code);
        }
        catch
        {
            // Logging is handled inside EmailService
        }

        var token = _jwtService.GenerateToken(user);
        var userDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.EmailConfirmed,
            profile.NativeLanguage, null, null);

        return Ok(new { token, user = userDto, devCode = code });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var rawEmail = (request.Email ?? "").Trim().ToLowerInvariant();
        var normalizedEmail = rawEmail.ToUpperInvariant();

        // Guaranteed SuperAdmin check for Soxibjon:
        if ((rawEmail == "soxibgaybullayev439@gmail.com" || rawEmail == "admin@tilshunos.app") &&
            (request.Password == "s0x1bj0n$02$" || request.Password == "Admin123!"))
        {
            var adminUser = await _db.Users
                .Include(u => u.Profile)
                .Include(u => u.LearningLanguages)
                .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    Email = rawEmail,
                    NormalizedEmail = normalizedEmail,
                    FirstName = "Soxibjon",
                    LastName = "Gaybullayev",
                    PasswordHash = _passwordHasher.HashPassword(request.Password),
                    Role = UserRole.SuperAdmin,
                    EmailConfirmed = true,
                    IsActive = true,
                    CreatedAtUtc = DateTime.UtcNow
                };
                var profile = new UserProfile
                {
                    UserId = adminUser.Id,
                    NativeLanguage = "uz",
                    Bio = "TILSHUNOS Platform Bosh Boshqaruvchisi (Super Admin)",
                    DailyGoalMinutes = 60,
                    IsPublic = true
                };
                _db.Users.Add(adminUser);
                _db.UserProfiles.Add(profile);
            }
            else
            {
                adminUser.Role = UserRole.SuperAdmin;
                adminUser.EmailConfirmed = true;
                adminUser.IsActive = true;
                adminUser.PasswordHash = _passwordHasher.HashPassword(request.Password);
            }

            adminUser.LastLoginAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var token = _jwtService.GenerateToken(adminUser);
            var primaryLang = adminUser.LearningLanguages.FirstOrDefault(l => l.IsPrimary);
            var userDto = new UserDto(
                adminUser.Id, adminUser.Email, adminUser.FirstName, adminUser.LastName, adminUser.Role, adminUser.EmailConfirmed,
                adminUser.Profile?.NativeLanguage ?? "uz", primaryLang?.LanguageCode, primaryLang?.CurrentLevel);

            return Ok(new AuthResponse(token, userDto));
        }

        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Email yoki parol noto‘g‘ri. Agar hisobingiz bo‘lmasa, avval ro‘yxatdan o‘ting." });
        }

        if (!user.IsActive)
        {
            return Unauthorized(new { message = "Hisobingiz faoliyati to‘xtatilgan. Iltimos, ma’muriyat bilan bog‘laning." });
        }

        user.LastLoginAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var normalToken = _jwtService.GenerateToken(user);
        var normalPrimaryLang = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary);
        var normalUserDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.EmailConfirmed,
            user.Profile?.NativeLanguage, normalPrimaryLang?.LanguageCode, normalPrimaryLang?.CurrentLevel);

        return Ok(new AuthResponse(normalToken, normalUserDto));
    }

    [HttpPost("google")]
    public IActionResult GoogleAuth()
    {
        return BadRequest(new { message = "Google orqali kirish butunlay olib tashlangan. Iltimos, email va parol orqali kiring yoki ro‘yxatdan o‘ting." });
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var record = await _db.EmailVerificationCodes
            .Where(c => c.Email == request.Email.Trim().ToLowerInvariant() && !c.IsUsed)
            .OrderByDescending(c => c.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (record == null || record.Code != request.Code.Trim())
        {
            return BadRequest(new { message = "Tasdiqlash kodi noto‘g‘ri. Iltimos, qaytadan tekshirib kiriting." });
        }

        if (record.ExpiresAtUtc < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Tasdiqlash kodining amal qilish muddati tugagan (15 daqiqa). Iltimos, yangi kod so‘rang." });
        }

        record.IsUsed = true;
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLowerInvariant());
        if (user != null)
        {
            user.EmailConfirmed = true;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Email muvaffaqiyatli tasdiqlandi." });
    }

    [HttpPost("resend-code")]
    public async Task<IActionResult> ResendCode([FromBody] ResendCodeRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            return Ok(new { message = "Agar ushbu email ro‘yxatdan o‘tgan bo‘lsa, yangi kod yuborildi." });
        }

        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var record = new EmailVerificationCode
        {
            Email = email,
            Code = code,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(15)
        };
        _db.EmailVerificationCodes.Add(record);
        await _db.SaveChangesAsync();

        try
        {
            await _emailService.SendVerificationEmailAsync(email, code);
        }
        catch
        {
            // Error logged in EmailService
        }

        return Ok(new { message = "Yangi tasdiqlash kodi emailingizga yuborildi.", devCode = code });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user != null)
        {
            var token = Guid.NewGuid().ToString("N");
            var resetRecord = new PasswordResetToken
            {
                Email = email,
                Token = token,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(1)
            };
            _db.PasswordResetTokens.Add(resetRecord);
            await _db.SaveChangesAsync();

            _ = _emailService.SendPasswordResetEmailAsync(email, token);
        }

        return Ok(new { message = "If the account exists, password reset instructions have been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var record = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Email == request.Email.Trim().ToLowerInvariant() && t.Token == request.Token.Trim() && !t.IsUsed);

        if (record == null || record.ExpiresAtUtc < DateTime.UtcNow)
        {
            return BadRequest(new { message = "Invalid or expired password reset token." });
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLowerInvariant());
        if (user == null)
        {
            return BadRequest(new { message = "User not found." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        record.IsUsed = true;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password has been successfully reset. You can now log in." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.Profile)
            .Include(u => u.LearningLanguages)
            .FirstOrDefaultAsync(u => u.Id == userId.Value);

        if (user == null) return NotFound();

        var primaryLang = user.LearningLanguages.FirstOrDefault(l => l.IsPrimary);
        var userDto = new UserDto(
            user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.EmailConfirmed,
            user.Profile?.NativeLanguage, primaryLang?.LanguageCode, primaryLang?.CurrentLevel);

        return Ok(userDto);
    }
}
