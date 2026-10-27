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
[Route("api/v1/materials")]
public class MaterialsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUserService;

    public MaterialsController(AppDbContext db, ICurrentUserService currentUserService)
    {
        _db = db;
        _currentUserService = currentUserService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetMaterials(
        [FromQuery] MaterialContentType? contentType,
        [FromQuery] CefrLevel? level,
        [FromQuery] string? languageCode,
        [FromQuery] string? search)
    {
        var query = _db.LearningMaterials
            .Include(m => m.ContentGroup)
            .Where(m => m.IsPublished);

        if (contentType.HasValue) query = query.Where(m => m.ContentType == contentType.Value);
        if (level.HasValue) query = query.Where(m => m.Level == level.Value);
        if (!string.IsNullOrWhiteSpace(languageCode)) query = query.Where(m => m.LanguageCode == languageCode);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(m => m.Title.ToLower().Contains(term) || m.Description.ToLower().Contains(term));
        }

        var userId = _currentUserService.UserId;
        var progressMap = new Dictionary<Guid, MaterialProgress>();
        if (userId.HasValue)
        {
            var progressList = await _db.MaterialProgressRecords.Where(p => p.UserId == userId.Value).ToListAsync();
            progressMap = progressList.ToDictionary(p => p.MaterialId);
        }

        var items = await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Select(m => new
            {
                m.Id,
                m.ContentGroupId,
                m.Title,
                m.Description,
                m.ContentType,
                m.Level,
                m.LanguageCode,
                m.AudioUrl,
                m.VideoUrl,
                m.EstimatedMinutes,
                m.Attribution,
                m.CreatedAtUtc
            })
            .ToListAsync();

        var result = items.Select(m =>
        {
            progressMap.TryGetValue(m.Id, out var prog);
            return new
            {
                m.Id,
                m.ContentGroupId,
                m.Title,
                m.Description,
                m.ContentType,
                m.Level,
                m.LanguageCode,
                m.AudioUrl,
                m.VideoUrl,
                m.EstimatedMinutes,
                m.Attribution,
                IsCompleted = prog?.IsCompleted ?? false,
                UserScore = prog?.Score ?? 0,
                ProgressPercentage = prog?.ProgressPercentage ?? 0
            };
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMaterialDetail(Guid id)
    {
        var material = await _db.LearningMaterials
            .Include(m => m.ContentGroup)
            .ThenInclude(cg => cg!.Versions)
            .FirstOrDefaultAsync(m => m.Id == id && m.IsPublished);

        if (material == null) return NotFound(new { message = "Material not found." });

        var userId = _currentUserService.UserId;
        var progress = userId.HasValue 
            ? await _db.MaterialProgressRecords.FirstOrDefaultAsync(p => p.UserId == userId.Value && p.MaterialId == id)
            : null;

        var availableVersions = material.ContentGroup?.Versions
            .Where(v => v.IsPublished)
            .Select(v => new LevelVersionInfoDto(v.Id, v.Level, v.Title))
            .ToList();

        var dto = new LearningMaterialDto(
            material.Id,
            material.ContentGroupId,
            material.Title,
            material.Description,
            material.ContentType,
            material.Level,
            material.LanguageCode,
            material.ContentBody,
            material.AudioUrl,
            material.VideoUrl,
            material.SourceUrl,
            material.Attribution,
            material.EstimatedMinutes,
            material.VocabularyListJson,
            material.ComprehensionQuestionsJson,
            progress?.IsCompleted ?? false,
            progress?.Score ?? 0,
            availableVersions
        );

        return Ok(dto);
    }

    [HttpPost("{id:guid}/progress")]
    public async Task<IActionResult> RecordProgress(Guid id, [FromBody] RecordMaterialProgressRequest request)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue) return Unauthorized();

        var material = await _db.LearningMaterials.FirstOrDefaultAsync(m => m.Id == id);
        if (material == null) return NotFound();

        var progress = await _db.MaterialProgressRecords.FirstOrDefaultAsync(p => p.UserId == userId.Value && p.MaterialId == id);
        if (progress == null)
        {
            progress = new MaterialProgress
            {
                UserId = userId.Value,
                MaterialId = id,
                LastAccessedAtUtc = DateTime.UtcNow
            };
            _db.MaterialProgressRecords.Add(progress);
        }

        progress.Score = Math.Max(progress.Score, request.Score);
        progress.ProgressPercentage = Math.Max(progress.ProgressPercentage, request.ProgressPercentage);
        progress.LastAccessedAtUtc = DateTime.UtcNow;

        if (request.MarkCompleted && !progress.IsCompleted)
        {
            progress.IsCompleted = true;
            progress.CompletedAtUtc = DateTime.UtcNow;
            progress.ProgressPercentage = 100;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Progress saved.", isCompleted = progress.IsCompleted, score = progress.Score });
    }
}
