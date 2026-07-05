using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class ContactInfoService(AppDbContext db) : IContactInfoService
    {
        // Bảng chỉ có duy nhất 1 bản ghi thông tin liên hệ, cố định Id = 1.
        private const int SingletonId = 1;

        // ── Get (dùng chung cho trang công khai và quản trị) ──────────────────────

        public async Task<ContactInfoDto> GetAsync()
        {
            var entity = await GetOrCreateEntityAsync();
            return MapToDto(entity);
        }

        // ── Update ─────────────────────────────────────────────────────────────

        public async Task<ContactInfoDto> UpdateAsync(UpdateContactInfoDto dto)
        {
            var entity = await GetOrCreateEntityAsync();

            entity.ParishName      = dto.ParishName.Trim();
            entity.Address         = dto.Address.Trim();
            entity.Phone           = dto.Phone.Trim();
            entity.EmergencyPhone  = string.IsNullOrWhiteSpace(dto.EmergencyPhone) ? null : dto.EmergencyPhone.Trim();
            entity.Email           = dto.Email.Trim();
            entity.Facebook        = string.IsNullOrWhiteSpace(dto.Facebook) ? null : dto.Facebook.Trim();
            entity.Youtube         = string.IsNullOrWhiteSpace(dto.Youtube) ? null : dto.Youtube.Trim();
            entity.Zalo            = string.IsNullOrWhiteSpace(dto.Zalo) ? null : dto.Zalo.Trim();
            entity.MapEmbedUrl     = string.IsNullOrWhiteSpace(dto.MapEmbedUrl) ? null : dto.MapEmbedUrl.Trim();
            entity.MapUrl          = string.IsNullOrWhiteSpace(dto.MapUrl) ? null : dto.MapUrl.Trim();
            entity.OfficeHours     = string.IsNullOrWhiteSpace(dto.OfficeHours) ? null : dto.OfficeHours.Trim();
            entity.MassSchedule    = string.IsNullOrWhiteSpace(dto.MassSchedule) ? null : dto.MassSchedule.Trim();
            entity.UpdatedAt       = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        /// <summary>
        /// Lấy bản ghi thông tin liên hệ duy nhất trong DB. Nếu vì lý do nào đó DB chưa có
        /// bản ghi (ví dụ migration seed bị xoá thủ công), tự tạo một bản ghi rỗng để đảm
        /// bảo mọi dữ liệu trả về LUÔN lấy từ DB — không dùng dữ liệu set cứng trong code.
        /// </summary>
        private async Task<ContactInfo> GetOrCreateEntityAsync()
        {
            var entity = await db.ContactInfos.FirstOrDefaultAsync(c => c.Id == SingletonId);
            if (entity is not null) return entity;

            var now = DateTime.UtcNow;
            entity = new ContactInfo
            {
                Id         = SingletonId,
                ParishName = string.Empty,
                Address    = string.Empty,
                Phone      = string.Empty,
                Email      = string.Empty,
                CreatedAt  = now,
                UpdatedAt  = now,
            };

            db.ContactInfos.Add(entity);
            await db.SaveChangesAsync();
            return entity;
        }

        private static ContactInfoDto MapToDto(ContactInfo c) => new(
            c.Id,
            c.ParishName,
            c.Address,
            c.Phone,
            c.EmergencyPhone,
            c.Email,
            c.Facebook,
            c.Youtube,
            c.Zalo,
            c.MapEmbedUrl,
            c.MapUrl,
            c.OfficeHours,
            c.MassSchedule,
            c.CreatedAt,
            c.UpdatedAt
        );
    }
}
