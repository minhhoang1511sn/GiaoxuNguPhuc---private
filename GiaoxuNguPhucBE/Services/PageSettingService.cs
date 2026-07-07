using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class PageSettingService(AppDbContext db) : IPageSettingService
    {
        // Danh sách các trang được phép cấu hình ảnh bìa — khớp với PAGES ở FE
        // (app/admin/banners/page.jsx). Chặn PageKey lạ để tránh rác dữ liệu trong DB.
        private static readonly HashSet<string> AllowedPageKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "about", "ministries", "contact", "news", "register", "calendar"
        };

        // ── Get ────────────────────────────────────────────────────────────────

        public async Task<PageSettingDto> GetAsync(string pageKey)
        {
            var entity = await GetOrCreateEntityAsync(pageKey);
            return MapToDto(entity);
        }

        public async Task<IReadOnlyList<PageSettingDto>> GetAllAsync()
        {
            var entities = await db.PageSettings
                .OrderBy(p => p.PageKey)
                .ToListAsync();
            return entities.Select(MapToDto).ToList();
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<PageSettingDto?> UpdateAsync(string pageKey, UpdatePageSettingDto dto)
        {
            var key = NormalizeKey(pageKey);
            if (!AllowedPageKeys.Contains(key))
                return null;

            var entity = await GetOrCreateEntityAsync(key);
            entity.BannerImageUrl = string.IsNullOrWhiteSpace(dto.BannerImageUrl) ? null : dto.BannerImageUrl.Trim();
            entity.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static string NormalizeKey(string pageKey) => (pageKey ?? string.Empty).Trim().ToLowerInvariant();

        /// <summary>
        /// Lấy bản ghi cấu hình của một trang. Nếu chưa có (trang mới thêm sau này,
        /// hoặc dữ liệu seed bị xoá thủ công), tự tạo bản ghi rỗng (chưa có ảnh bìa,
        /// dùng ảnh mặc định phía FE) để đảm bảo mọi truy vấn GET luôn có kết quả.
        /// </summary>
        private async Task<PageSetting> GetOrCreateEntityAsync(string pageKey)
        {
            var key = NormalizeKey(pageKey);
            var entity = await db.PageSettings.FirstOrDefaultAsync(p => p.PageKey == key);
            if (entity is not null) return entity;

            entity = new PageSetting
            {
                PageKey = key,
                BannerImageUrl = null,
                UpdatedAt = DateTime.UtcNow,
            };

            db.PageSettings.Add(entity);
            await db.SaveChangesAsync();
            return entity;
        }

        private static PageSettingDto MapToDto(PageSetting p) => new(p.PageKey, p.BannerImageUrl, p.UpdatedAt);
    }
}
