using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class ClergyMemberService(AppDbContext db) : IClergyMemberService
    {
        // ── GetCurrent (public, phía user) ─────────────────────────────────────

        public async Task<List<ClergyMemberDto>> GetCurrentAsync()
        {
            var items = await db.ClergyMembers
                .Where(c => c.IsCurrent)
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetAll (admin) ─────────────────────────────────────────────────────

        public async Task<List<ClergyMemberDto>> GetAllAsync()
        {
            var items = await db.ClergyMembers
                .OrderByDescending(c => c.IsCurrent)
                .ThenBy(c => c.DisplayOrder)
                .ThenBy(c => c.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── GetById ────────────────────────────────────────────────────────────

        public async Task<ClergyMemberDto?> GetByIdAsync(int id)
        {
            var entity = await db.ClergyMembers.FindAsync(id);
            return entity is null ? null : MapToDto(entity);
        }

        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<ClergyMemberDto> CreateAsync(CreateClergyMemberDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new ClergyMember
            {
                FullName     = dto.FullName.Trim(),
                Type         = dto.Type,
                Position     = dto.Position.Trim(),
                MinistryName = string.IsNullOrWhiteSpace(dto.MinistryName) ? null : dto.MinistryName.Trim(),
                SchoolYear   = string.IsNullOrWhiteSpace(dto.SchoolYear) ? null : dto.SchoolYear.Trim(),
                IsCurrent    = dto.IsCurrent,
                ImageUrl     = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim(),
                Email        = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim(),
                Phone        = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
                Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                DisplayOrder = dto.DisplayOrder,
                CreatedAt    = now,
                UpdatedAt    = now,
            };

            db.ClergyMembers.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<ClergyMemberDto?> UpdateAsync(int id, UpdateClergyMemberDto dto)
        {
            var entity = await db.ClergyMembers.FindAsync(id);
            if (entity is null) return null;

            entity.FullName     = dto.FullName.Trim();
            entity.Type         = dto.Type;
            entity.Position     = dto.Position.Trim();
            entity.MinistryName = string.IsNullOrWhiteSpace(dto.MinistryName) ? null : dto.MinistryName.Trim();
            entity.SchoolYear   = string.IsNullOrWhiteSpace(dto.SchoolYear) ? null : dto.SchoolYear.Trim();
            entity.IsCurrent    = dto.IsCurrent;
            entity.ImageUrl     = string.IsNullOrWhiteSpace(dto.ImageUrl) ? null : dto.ImageUrl.Trim();
            entity.Email        = string.IsNullOrWhiteSpace(dto.Email) ? null : dto.Email.Trim();
            entity.Phone        = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim();
            entity.Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            entity.DisplayOrder = dto.DisplayOrder;
            entity.UpdatedAt    = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.ClergyMembers.FindAsync(id);
            if (entity is null) return false;

            db.ClergyMembers.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static ClergyMemberDto MapToDto(ClergyMember c) => new(
            c.Id,
            c.FullName,
            (int)c.Type,
            c.Type.ToString(),
            c.Position,
            c.MinistryName,
            c.SchoolYear,
            c.IsCurrent,
            c.ImageUrl,
            c.Email,
            c.Phone,
            c.Description,
            c.DisplayOrder,
            c.CreatedAt,
            c.UpdatedAt
        );
    }
}
