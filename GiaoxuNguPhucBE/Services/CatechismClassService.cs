using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class CatechismClassService(AppDbContext db) : ICatechismClassService
    {
        // ── GetActive (public, phía user) ─────────────────────────────────────

        public async Task<List<CatechismClassDto>> GetActiveAsync()
        {
            var items = await db.CatechismClasses
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetAll (admin) ─────────────────────────────────────────────────────

        public async Task<List<CatechismClassDto>> GetAllAsync()
        {
            var items = await db.CatechismClasses
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetById ────────────────────────────────────────────────────────────

        public async Task<CatechismClassDto?> GetByIdAsync(int id)
        {
            var entity = await db.CatechismClasses.FindAsync(id);
            return entity is null ? null : MapToDto(entity);
        }

        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<CatechismClassDto> CreateAsync(CreateCatechismClassDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new CatechismClass
            {
                Name         = dto.Name.Trim(),
                Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                ClassType    = dto.ClassType,
                SchoolYear   = string.IsNullOrWhiteSpace(dto.SchoolYear) ? null : dto.SchoolYear.Trim(),
                DisplayOrder = dto.DisplayOrder,
                IsActive     = dto.IsActive,
                CreatedAt    = now,
                UpdatedAt    = now,
            };

            db.CatechismClasses.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<CatechismClassDto?> UpdateAsync(int id, UpdateCatechismClassDto dto)
        {
            var entity = await db.CatechismClasses.FindAsync(id);
            if (entity is null) return null;

            entity.Name         = dto.Name.Trim();
            entity.Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            entity.ClassType    = dto.ClassType;
            entity.SchoolYear   = string.IsNullOrWhiteSpace(dto.SchoolYear) ? null : dto.SchoolYear.Trim();
            entity.DisplayOrder = dto.DisplayOrder;
            entity.IsActive     = dto.IsActive;
            entity.UpdatedAt    = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.CatechismClasses.FindAsync(id);
            if (entity is null) return false;

            db.CatechismClasses.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static CatechismClassDto MapToDto(CatechismClass c) => new(
            c.Id,
            c.Name,
            c.Description,
            (int)c.ClassType,
            c.ClassType.ToString(),
            c.SchoolYear,
            c.DisplayOrder,
            c.IsActive,
            c.CreatedAt,
            c.UpdatedAt
        );
    }
}
