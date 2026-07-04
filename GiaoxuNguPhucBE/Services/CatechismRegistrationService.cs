using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class CatechismRegistrationService(AppDbContext db) : ICatechismRegistrationService
    {
        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<CatechismRegistrationDto> CreateAsync(CreateCatechismRegistrationDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new CatechismRegistration
            {
                FullName      = dto.FullName.Trim(),
                DateOfBirth   = dto.DateOfBirth,
                Gender        = dto.Gender,
                FatherName    = dto.FatherName,
                MotherName    = dto.MotherName,
                Phone         = dto.Phone.Trim(),
                Email         = dto.Email,
                Address       = dto.Address.Trim(),
                ParishZone    = dto.ParishZone,
                ClassType     = dto.ClassType,
                SchoolYear    = dto.SchoolYear.Trim(),
                IsBaptized    = dto.IsBaptized,
                BaptismPlace  = dto.BaptismPlace,
                Note          = dto.Note,
                Status        = RegistrationStatus.Pending,
                CreatedAt     = now,
                UpdatedAt     = now,
            };

            db.CatechismRegistrations.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── GetAll (admin, có lọc + phân trang) ──────────────────────────────────

        public async Task<PagedResult<CatechismRegistrationDto>> GetAllAsync(RegistrationQueryParams q)
        {
            var query = BuildFilteredQuery(q);

            query = (q.SortBy.ToLower(), q.SortOrder.ToLower()) switch
            {
                ("fullname", "asc")  => query.OrderBy(r => r.FullName),
                ("fullname", _)      => query.OrderByDescending(r => r.FullName),
                ("createdat", "asc") => query.OrderBy(r => r.CreatedAt),
                ("createdat", _)     => query.OrderByDescending(r => r.CreatedAt),
                ("status", "asc")    => query.OrderBy(r => r.Status),
                ("status", _)        => query.OrderByDescending(r => r.Status),
                _                    => query.OrderByDescending(r => r.CreatedAt),
            };

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ToListAsync();

            return new PagedResult<CatechismRegistrationDto>(
                items.Select(MapToDto).ToList(),
                totalCount,
                q.Page,
                q.PageSize,
                (int)Math.Ceiling((double)totalCount / q.PageSize)
            );
        }

        // ── GetForExport (không phân trang, dùng cho xuất Excel) ─────────────────

        public async Task<List<CatechismRegistration>> GetForExportAsync(RegistrationQueryParams q)
        {
            var query = BuildFilteredQuery(q).OrderByDescending(r => r.CreatedAt);
            return await query.ToListAsync();
        }

        // ── GetById ────────────────────────────────────────────────────────────

        public async Task<CatechismRegistrationDto?> GetByIdAsync(int id)
        {
            var entity = await db.CatechismRegistrations.FindAsync(id);
            return entity is null ? null : MapToDto(entity);
        }

        // ── UpdateStatus ───────────────────────────────────────────────────────

        public async Task<CatechismRegistrationDto?> UpdateStatusAsync(int id, UpdateRegistrationStatusDto dto)
        {
            var entity = await db.CatechismRegistrations.FindAsync(id);
            if (entity is null) return null;

            entity.Status = dto.Status;
            entity.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.CatechismRegistrations.FindAsync(id);
            if (entity is null) return false;

            db.CatechismRegistrations.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private IQueryable<CatechismRegistration> BuildFilteredQuery(RegistrationQueryParams q)
        {
            var query = db.CatechismRegistrations.AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
                query = query.Where(r =>
                    r.FullName.Contains(q.Search) ||
                    r.Phone.Contains(q.Search) ||
                    (r.Email != null && r.Email.Contains(q.Search)));

            if (q.ClassType.HasValue)
                query = query.Where(r => r.ClassType == q.ClassType);

            if (q.Status.HasValue)
                query = query.Where(r => r.Status == q.Status);

            if (!string.IsNullOrWhiteSpace(q.SchoolYear))
                query = query.Where(r => r.SchoolYear == q.SchoolYear);

            if (!string.IsNullOrWhiteSpace(q.ParishZone))
                query = query.Where(r => r.ParishZone == q.ParishZone);

            if (q.FromDate.HasValue)
                query = query.Where(r => r.CreatedAt >= q.FromDate.Value);

            if (q.ToDate.HasValue)
                query = query.Where(r => r.CreatedAt <= q.ToDate.Value);

            return query;
        }

        private static CatechismRegistrationDto MapToDto(CatechismRegistration r) => new(
            r.Id,
            r.FullName,
            r.DateOfBirth,
            r.Gender,
            r.FatherName,
            r.MotherName,
            r.Phone,
            r.Email,
            r.Address,
            r.ParishZone,
            r.ClassType.ToString(),
            r.SchoolYear,
            r.IsBaptized,
            r.BaptismPlace,
            r.Note,
            r.Status.ToString(),
            r.CreatedAt,
            r.UpdatedAt
        );
    }
}
