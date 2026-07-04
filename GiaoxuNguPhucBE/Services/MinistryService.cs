using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class MinistryService(AppDbContext db) : IMinistryService
    {
        // ── GetActive (public, phía user) ──────────────────────────────────────

        public async Task<List<MinistryDto>> GetActiveAsync()
        {
            var items = await db.Ministries
                .Where(m => m.IsActive)
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetAll (admin) ─────────────────────────────────────────────────────

        public async Task<List<MinistryDto>> GetAllAsync()
        {
            var items = await db.Ministries
                .OrderByDescending(m => m.IsActive)
                .ThenBy(m => m.DisplayOrder)
                .ThenBy(m => m.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetById ────────────────────────────────────────────────────────────

        public async Task<MinistryDto?> GetByIdAsync(int id)
        {
            var entity = await db.Ministries.FindAsync(id);
            return entity is null ? null : MapToDto(entity);
        }

        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<MinistryDto> CreateAsync(CreateMinistryDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new Ministry
            {
                Name          = dto.Name.Trim(),
                Category      = dto.Category,
                CategoryLabel = string.IsNullOrWhiteSpace(dto.CategoryLabel) ? null : dto.CategoryLabel.Trim(),
                Description   = dto.Description.Trim(),
                ImageUrl      = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim(),
                Icon          = string.IsNullOrWhiteSpace(dto.Icon) ? null : dto.Icon.Trim(),
                DisplayOrder  = dto.DisplayOrder,
                IsActive      = dto.IsActive,
                CreatedAt     = now,
                UpdatedAt     = now,
            };

            db.Ministries.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<MinistryDto?> UpdateAsync(int id, UpdateMinistryDto dto)
        {
            var entity = await db.Ministries.FindAsync(id);
            if (entity is null) return null;

            entity.Name          = dto.Name.Trim();
            entity.Category      = dto.Category;
            entity.CategoryLabel = string.IsNullOrWhiteSpace(dto.CategoryLabel) ? null : dto.CategoryLabel.Trim();
            entity.Description   = dto.Description.Trim();
            entity.ImageUrl      = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
            entity.Icon          = string.IsNullOrWhiteSpace(dto.Icon) ? null : dto.Icon.Trim();
            entity.DisplayOrder  = dto.DisplayOrder;
            entity.IsActive      = dto.IsActive;
            entity.UpdatedAt     = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.Ministries.FindAsync(id);
            if (entity is null) return false;

            db.Ministries.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static MinistryDto MapToDto(Ministry m) => new(
            m.Id,
            m.Name,
            (int)m.Category,
            m.Category.ToString(),
            m.CategoryLabel,
            m.Description,
            m.ImageUrl,
            m.Icon,
            m.DisplayOrder,
            m.IsActive,
            m.CreatedAt,
            m.UpdatedAt
        );
    }
}
