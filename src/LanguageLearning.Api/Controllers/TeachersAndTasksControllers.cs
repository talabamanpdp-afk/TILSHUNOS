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
[Route("api/v1/teachers")]
public class TeachersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public TeachersController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetTeachers(
        [FromQuery] string? language,
        [FromQuery] string? search)
    {
        // 1. Auto-sync: Ensure every User with Role == Teacher has an approved TeacherProfile
        var teachersWithoutProfile = await _db.Users
            .Where(u => u.Role == UserRole.Teacher && !_db.TeacherProfiles.Any(t => t.UserId == u.Id))
            .ToListAsync();

        if (teachersWithoutProfile.Count != 0)
        {
            foreach (var u in teachersWithoutProfile)
            {
                _db.TeacherProfiles.Add(new TeacherProfile
                {
                    UserId = u.Id,
                    Bio = "Ingliz tili va xalqaro imtihonlar (IELTS / CEFR) bo‘yicha tajribali o‘qituvchi.",
                    Qualifications = "English · B1–C1 Mutaxassisi",
                    LanguagesTaught = "English",
                    CefrLevelsTaught = "A1,A2,B1,B2,C1",
                    IsApproved = true
                });
            }
            await _db.SaveChangesAsync();
        }

        var query = _db.TeacherProfiles
            .Include(t => t.User)
            .ThenInclude(u => u.Profile)
            .Where(t => t.IsApproved);

        if (!string.IsNullOrWhiteSpace(language))
        {
            query = query.Where(t => t.LanguagesTaught.Contains(language));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(t => (t.User.FirstName + " " + t.User.LastName).ToLower().Contains(term) || t.Bio.ToLower().Contains(term));
        }

        var teachers = await query
            .Select(t => new
            {
                id = t.UserId,
                userId = t.UserId,
                firstName = t.User.FirstName,
                lastName = t.User.LastName,
                name = ($"{t.User.FirstName} {t.User.LastName}".Trim() != "" ? $"{t.User.FirstName} {t.User.LastName}".Trim() : t.User.Email),
                fullName = ($"{t.User.FirstName} {t.User.LastName}".Trim() != "" ? $"{t.User.FirstName} {t.User.LastName}".Trim() : t.User.Email),
                email = t.User.Email,
                avatarUrl = t.User.Profile != null ? t.User.Profile.AvatarUrl : null,
                bio = t.Bio,
                specialty = t.Qualifications,
                qualifications = t.Qualifications,
                languagesTaught = t.LanguagesTaught,
                cefrLevelsTaught = t.CefrLevelsTaught,
                externalContactUrl = t.ExternalContactUrl,
                hourlyRate = t.HourlyRate,
                teachingExperienceYears = t.TeachingExperienceYears,
                isApproved = t.IsApproved,
                isActive = t.User.IsActive,
                students = _db.TeacherStudentConnections.Count(c => c.TeacherId == t.UserId),
                status = t.User.IsActive ? "Faol" : "Nofaol"
            })
            .ToListAsync();

        return Ok(teachers);
    }

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetTeacher(Guid id)
    {
        var teacher = await _db.TeacherProfiles
            .Include(t => t.User)
            .ThenInclude(u => u.Profile)
            .FirstOrDefaultAsync(t => t.UserId == id);

        if (teacher == null) return NotFound();

        var dto = new TeacherProfileDto(
            teacher.UserId,
            $"{teacher.User.FirstName} {teacher.User.LastName}",
            teacher.User.Profile?.AvatarUrl,
            teacher.Bio,
            teacher.Qualifications,
            teacher.LanguagesTaught,
            teacher.CefrLevelsTaught,
            teacher.ExternalContactUrl,
            teacher.HourlyRate,
            teacher.TeachingExperienceYears,
            teacher.IsApproved
        );

        return Ok(dto);
    }

    [HttpPost("apply")]
    public async Task<IActionResult> ApplyToBecomeTeacher([FromBody] TeacherProfileDto request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var user = await _db.Users.Include(u => u.TeacherProfile).FirstOrDefaultAsync(u => u.Id == userId.Value);
        if (user == null) return NotFound();

        if (user.TeacherProfile != null)
        {
            user.TeacherProfile.Bio = request.Bio;
            user.TeacherProfile.Qualifications = request.Qualifications;
            user.TeacherProfile.LanguagesTaught = request.LanguagesTaught;
            user.TeacherProfile.CefrLevelsTaught = request.CefrLevelsTaught;
            user.TeacherProfile.ExternalContactUrl = request.ExternalContactUrl;
            user.TeacherProfile.HourlyRate = request.HourlyRate;
            user.TeacherProfile.TeachingExperienceYears = request.TeachingExperienceYears;
        }
        else
        {
            var profile = new TeacherProfile
            {
                UserId = user.Id,
                Bio = request.Bio,
                Qualifications = request.Qualifications,
                LanguagesTaught = request.LanguagesTaught,
                CefrLevelsTaught = request.CefrLevelsTaught,
                ExternalContactUrl = request.ExternalContactUrl,
                HourlyRate = request.HourlyRate,
                TeachingExperienceYears = request.TeachingExperienceYears,
                IsApproved = true // Auto-approved in sandbox, or subject to admin moderation
            };
            user.Role = UserRole.Teacher;
            _db.TeacherProfiles.Add(profile);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Teacher application saved successfully." });
    }

    [HttpPost("{id:guid}/connect")]
    public async Task<IActionResult> RequestConnection(Guid id)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue) return Unauthorized();

        if (studentId.Value == id)
        {
            return BadRequest(new { message = "You cannot connect with yourself." });
        }

        var existing = await _db.TeacherStudentConnections
            .FirstOrDefaultAsync(c => c.TeacherId == id && c.StudentId == studentId.Value);

        if (existing != null)
        {
            return Ok(new { message = "Connection already requested or active.", status = existing.Status.ToString() });
        }

        var connection = new TeacherStudentConnection
        {
            TeacherId = id,
            StudentId = studentId.Value,
            Status = ConnectionStatus.Accepted, // Direct connect enabled for smooth collaboration
            RequestedAtUtc = DateTime.UtcNow,
            RespondedAtUtc = DateTime.UtcNow
        };

        _db.TeacherStudentConnections.Add(connection);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Teacher connected successfully!" });
    }

    [HttpGet("connections")]
    public async Task<IActionResult> GetConnections()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var connections = await _db.TeacherStudentConnections
            .Include(c => c.Teacher)
            .Include(c => c.Student)
            .Where(c => c.TeacherId == userId.Value || c.StudentId == userId.Value)
            .Select(c => new ConnectionRequestDto(
                c.Id,
                c.TeacherId,
                $"{c.Teacher.FirstName} {c.Teacher.LastName}",
                c.StudentId,
                $"{c.Student.FirstName} {c.Student.LastName}",
                c.Status,
                c.RequestedAtUtc
            ))
            .ToListAsync();

        return Ok(connections);
    }

    [HttpGet("my-profile")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var profile = await _db.TeacherProfiles
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.UserId == userId.Value);

        if (profile == null)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId.Value);
            profile = new TeacherProfile
            {
                UserId = userId.Value,
                Bio = "O‘quvchilarga ingliz tili grammatikasi va so‘z boyligini oshirish bo‘yicha amaliy darslar beraman.",
                Qualifications = "English · B1–C1 Mutaxassisi",
                LanguagesTaught = "English",
                CefrLevelsTaught = "A1,A2,B1,B2,C1",
                IsApproved = true
            };
            _db.TeacherProfiles.Add(profile);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                fullName = (user != null && $"{user.FirstName} {user.LastName}".Trim() != "") ? $"{user.FirstName} {user.LastName}".Trim() : user?.Email ?? "O'qituvchi",
                email = user?.Email ?? "",
                bio = profile.Bio,
                specialty = profile.Qualifications,
                telegram = "https://t.me/tilshunos_ustoz",
                instagram = "https://instagram.com/tilshunos_teacher",
                facebook = ""
            });
        }

        string tg = "", insta = "", fb = "";
        if (!string.IsNullOrEmpty(profile.ExternalContactUrl))
        {
            try
            {
                var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(profile.ExternalContactUrl);
                if (dict != null)
                {
                    dict.TryGetValue("telegram", out tg!);
                    dict.TryGetValue("instagram", out insta!);
                    dict.TryGetValue("facebook", out fb!);
                }
            }
            catch
            {
                tg = profile.ExternalContactUrl;
            }
        }

        return Ok(new
        {
            fullName = ($"{profile.User.FirstName} {profile.User.LastName}".Trim() != "") ? $"{profile.User.FirstName} {profile.User.LastName}".Trim() : profile.User.Email,
            email = profile.User.Email,
            bio = profile.Bio,
            specialty = profile.Qualifications,
            telegram = tg ?? "",
            instagram = insta ?? "",
            facebook = fb ?? ""
        });
    }

    [HttpPut("my-profile")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateTeacherProfileDetailsRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var profile = await _db.TeacherProfiles.FirstOrDefaultAsync(t => t.UserId == userId.Value);
        if (profile == null)
        {
            profile = new TeacherProfile
            {
                UserId = userId.Value,
                IsApproved = true
            };
            _db.TeacherProfiles.Add(profile);
        }

        if (!string.IsNullOrWhiteSpace(request.Bio)) profile.Bio = request.Bio.Trim();
        if (!string.IsNullOrWhiteSpace(request.Specialty)) profile.Qualifications = request.Specialty.Trim();

        var socials = new Dictionary<string, string>
        {
            ["telegram"] = request.Telegram?.Trim() ?? "",
            ["instagram"] = request.Instagram?.Trim() ?? "",
            ["facebook"] = request.Facebook?.Trim() ?? ""
        };
        profile.ExternalContactUrl = System.Text.Json.JsonSerializer.Serialize(socials);

        await _db.SaveChangesAsync();
        return Ok(new { success = true, message = "Profil muvaffaqiyatli yangilandi." });
    }

    [HttpGet("my-students")]
    public async Task<IActionResult> GetMyStudents()
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue) return Unauthorized();

        // Connected students
        var studentIds = await _db.TeacherStudentConnections
            .Where(c => c.TeacherId == teacherId.Value)
            .Select(c => c.StudentId)
            .ToListAsync();

        // If no explicit connections yet, fetch learners so teacher immediately has students to work with
        List<User> students;
        if (studentIds.Any())
        {
            students = await _db.Users
                .Include(u => u.Profile)
                .Include(u => u.LearningLanguages)
                .Where(u => studentIds.Contains(u.Id))
                .ToListAsync();
        }
        else
        {
            students = await _db.Users
                .Include(u => u.Profile)
                .Include(u => u.LearningLanguages)
                .Where(u => u.Id != teacherId.Value && u.Role != UserRole.Teacher && u.Role != UserRole.SuperAdmin)
                .Take(25)
                .ToListAsync();
        }

        var result = new List<object>();
        foreach (var s in students)
        {
            var taskCount = await _db.Assignments.CountAsync(a => a.TeacherId == teacherId.Value && a.StudentId == s.Id);
            var vocabCount = await _db.PersonalVocabularyEntries.CountAsync(v => v.UserId == s.Id);
            var primaryLang = s.LearningLanguages.FirstOrDefault(l => l.IsPrimary);
            var levelStr = primaryLang != null ? primaryLang.CurrentLevel.ToString() : "B1";

            result.Add(new
            {
                id = s.Id,
                name = ($"{s.FirstName} {s.LastName}".Trim() != "" ? $"{s.FirstName} {s.LastName}".Trim() : s.Email.Split('@')[0]),
                email = s.Email,
                targetLevel = levelStr,
                dailyGoalMinutes = s.Profile?.DailyGoalMinutes ?? 20,
                assignedTasksCount = taskCount,
                vocabularyCount = vocabCount,
                joinedDate = s.CreatedAtUtc.ToString("yyyy-MM-dd")
            });
        }

        return Ok(result);
    }
}

[Authorize]
[ApiController]
[Route("api/v1/tasks")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public TasksController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [HttpGet("my-tasks")]
    public async Task<IActionResult> GetMyTasks()
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue) return Unauthorized();

        var tasks = await _db.Assignments
            .Include(a => a.Teacher)
            .Include(a => a.Submissions)
            .Where(a => a.StudentId == studentId.Value)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new AssignmentDto(
                a.Id,
                a.TeacherId,
                $"{a.Teacher.FirstName} {a.Teacher.LastName}",
                a.StudentId,
                "",
                a.Title,
                a.Instructions,
                a.TaskType,
                a.Level,
                a.LanguageCode,
                a.DueDateUtc,
                a.Status,
                a.MaxScore,
                a.AttachmentJson,
                a.Submissions.OrderByDescending(s => s.Version).FirstOrDefault() != null 
                    ? a.Submissions.OrderByDescending(s => s.Version).First().TeacherGrade : null,
                a.Submissions.OrderByDescending(s => s.Version).FirstOrDefault() != null 
                    ? a.Submissions.OrderByDescending(s => s.Version).First().TeacherFeedback : null,
                a.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpGet("assigned-by-me")]
    public async Task<IActionResult> GetAssignedByMe()
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue) return Unauthorized();

        var tasks = await _db.Assignments
            .Include(a => a.Student)
            .Include(a => a.Submissions)
            .Where(a => a.TeacherId == teacherId.Value)
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new AssignmentDto(
                a.Id,
                a.TeacherId,
                "",
                a.StudentId,
                $"{a.Student.FirstName} {a.Student.LastName}",
                a.Title,
                a.Instructions,
                a.TaskType,
                a.Level,
                a.LanguageCode,
                a.DueDateUtc,
                a.Status,
                a.MaxScore,
                a.AttachmentJson,
                a.Submissions.OrderByDescending(s => s.Version).FirstOrDefault() != null 
                    ? a.Submissions.OrderByDescending(s => s.Version).First().TeacherGrade : null,
                a.Submissions.OrderByDescending(s => s.Version).FirstOrDefault() != null 
                    ? a.Submissions.OrderByDescending(s => s.Version).First().TeacherFeedback : null,
                a.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] CreateAssignmentRequest request)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue) return Unauthorized();

        var assignment = new Assignment
        {
            TeacherId = teacherId.Value,
            StudentId = request.StudentId,
            Title = request.Title.Trim(),
            Instructions = request.Instructions.Trim(),
            TaskType = request.TaskType,
            Level = request.Level,
            LanguageCode = request.LanguageCode,
            DueDateUtc = request.DueDateUtc,
            MaxScore = request.MaxScore,
            AttachmentJson = request.AttachmentJson,
            Status = AssignmentStatus.Assigned,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Assignments.Add(assignment);

        // Notify student
        _db.InAppNotifications.Add(new InAppNotification
        {
            UserId = request.StudentId,
            Title = "New Task Assigned",
            Message = $"You have received a new {request.TaskType} assignment: '{request.Title}'",
            Type = NotificationType.Assignment,
            LinkUrl = $"/tasks/{assignment.Id}",
            CreatedAtUtc = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Assignment created successfully.", assignmentId = assignment.Id });
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> SubmitAssignment(Guid id, [FromBody] SubmitAssignmentRequest request)
    {
        var studentId = _currentUserService.UserId;
        if (!studentId.HasValue) return Unauthorized();

        var assignment = await _db.Assignments
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == id && a.StudentId == studentId.Value);

        if (assignment == null) return NotFound();

        var nextVersion = (assignment.Submissions.MaxBy(s => s.Version)?.Version ?? 0) + 1;

        var submission = new AssignmentSubmission
        {
            AssignmentId = assignment.Id,
            StudentId = studentId.Value,
            Content = request.Content,
            Version = nextVersion,
            SubmittedAtUtc = DateTime.UtcNow
        };

        assignment.Status = AssignmentStatus.Submitted;
        _db.AssignmentSubmissions.Add(submission);

        _db.InAppNotifications.Add(new InAppNotification
        {
            UserId = assignment.TeacherId,
            Title = "Assignment Submitted",
            Message = $"Your student submitted work for '{assignment.Title}'",
            Type = NotificationType.Assignment,
            LinkUrl = $"/tasks/{assignment.Id}",
            CreatedAtUtc = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Assignment submitted successfully.", version = nextVersion });
    }

    [HttpPost("{id:guid}/grade")]
    public async Task<IActionResult> GradeAssignment(Guid id, [FromBody] GradeAssignmentRequest request)
    {
        var teacherId = _currentUserService.UserId;
        if (!teacherId.HasValue) return Unauthorized();

        var assignment = await _db.Assignments
            .Include(a => a.Submissions)
            .FirstOrDefaultAsync(a => a.Id == id && a.TeacherId == teacherId.Value);

        if (assignment == null) return NotFound();

        var latestSubmission = assignment.Submissions.OrderByDescending(s => s.Version).FirstOrDefault();
        if (latestSubmission == null)
        {
            return BadRequest(new { message = "Student has not submitted any work yet." });
        }

        latestSubmission.TeacherGrade = request.Grade;
        latestSubmission.TeacherFeedback = request.Feedback;
        latestSubmission.RubricCriteriaScoresJson = request.RubricCriteriaJson;
        latestSubmission.GradedAtUtc = DateTime.UtcNow;

        assignment.Status = AssignmentStatus.Reviewed;

        _db.InAppNotifications.Add(new InAppNotification
        {
            UserId = assignment.StudentId,
            Title = "Task Graded",
            Message = $"Your submission for '{assignment.Title}' has been graded: {request.Grade}/{assignment.MaxScore}",
            Type = NotificationType.Grade,
            LinkUrl = $"/tasks/{assignment.Id}",
            CreatedAtUtc = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(new { message = "Grade and feedback recorded successfully." });
    }
}
