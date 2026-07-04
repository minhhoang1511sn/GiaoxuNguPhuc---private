using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class ParishHistoryService(AppDbContext db) : IParishHistoryService
    {
        // ── GetAll (dùng chung cho trang công khai và quản trị) ──────────────────

        public async Task<List<ParishHistoryMilestoneDto>> GetAllAsync()
        {
            var items = await db.ParishHistoryMilestones
                .OrderBy(h => h.DisplayOrder)
                .ThenBy(h => h.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetById ────────────────────────────────────────────────────────────

        public async Task<ParishHistoryMilestoneDto?> GetByIdAsync(int id)
        {
            var entity = await db.ParishHistoryMilestones.FindAsync(id);
            return entity is null ? null : MapToDto(entity);
        }

        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<ParishHistoryMilestoneDto> CreateAsync(CreateParishHistoryMilestoneDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new ParishHistoryMilestone
            {
                Year         = dto.Year.Trim(),
                Title        = dto.Title.Trim(),
                Content      = dto.Content.Trim(),
                ImageUrl     = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim(),
                DisplayOrder = dto.DisplayOrder,
                CreatedAt    = now,
                UpdatedAt    = now,
            };

            db.ParishHistoryMilestones.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<ParishHistoryMilestoneDto?> UpdateAsync(int id, UpdateParishHistoryMilestoneDto dto)
        {
            var entity = await db.ParishHistoryMilestones.FindAsync(id);
            if (entity is null) return null;

            entity.Year         = dto.Year.Trim();
            entity.Title        = dto.Title.Trim();
            entity.Content      = dto.Content.Trim();
            entity.ImageUrl     = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
            entity.DisplayOrder = dto.DisplayOrder;
            entity.UpdatedAt    = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.ParishHistoryMilestones.FindAsync(id);
            if (entity is null) return false;

            db.ParishHistoryMilestones.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static ParishHistoryMilestoneDto MapToDto(ParishHistoryMilestone h) => new(
            h.Id,
            h.Year,
            h.Title,
            h.Content,
            h.ImageUrl,
            h.DisplayOrder,
            h.CreatedAt,
            h.UpdatedAt
        );
    }
}
