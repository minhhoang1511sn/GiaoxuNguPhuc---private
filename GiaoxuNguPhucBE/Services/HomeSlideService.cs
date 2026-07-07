using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class HomeSlideService(AppDbContext db) : IHomeSlideService
    {
        // ── GetAll (dùng chung cho trang công khai và quản trị) ──────────────────

        public async Task<List<HomeSlideDto>> GetAllAsync()
        {
            var items = await db.HomeSlides
                .OrderBy(s => s.DisplayOrder)
                .ThenBy(s => s.Id)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<HomeSlideDto> CreateAsync(CreateHomeSlideDto dto)
        {
            // Ảnh mới thêm luôn xếp cuối danh sách hiển thị, trừ khi admin có
            // truyền DisplayOrder cụ thể.
            var nextOrder = dto.DisplayOrder != 0
                ? dto.DisplayOrder
                : (await db.HomeSlides.Select(s => (int?)s.DisplayOrder).MaxAsync() ?? -1) + 1;

            var entity = new HomeSlide
            {
                ImageUrl     = dto.ImageUrl.Trim(),
                DisplayOrder = nextOrder,
                CreatedAt    = DateTime.UtcNow,
            };

            db.HomeSlides.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Delete ─────────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.HomeSlides.FindAsync(id);
            if (entity is null) return false;

            db.HomeSlides.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Reorder ────────────────────────────────────────────────────────────

        public async Task<bool> ReorderAsync(ReorderHomeSlidesDto dto)
        {
            var entities = await db.HomeSlides.ToListAsync();

            // Danh sách Id gửi lên phải khớp chính xác dữ liệu hiện có, tránh sắp
            // xếp nhầm khi FE gửi thiếu/thừa Id (ví dụ do đang thao tác đồng thời).
            var existingIds = entities.Select(e => e.Id).ToHashSet();
            if (dto.OrderedIds.Count != entities.Count || !existingIds.SetEquals(dto.OrderedIds))
                return false;

            for (var i = 0; i < dto.OrderedIds.Count; i++)
            {
                var entity = entities.First(e => e.Id == dto.OrderedIds[i]);
                entity.DisplayOrder = i;
            }

            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        private static HomeSlideDto MapToDto(HomeSlide s) => new(
            s.Id,
            s.ImageUrl,
            s.DisplayOrder,
            s.CreatedAt
        );
    }
}
