using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    // Lưu ý: EmailSettings được đăng ký trong Program.cs bằng
    // builder.Services.AddSingleton(emailSettings) — giống MinistryRegistrationService,
    // nên phải inject thẳng EmailSettings, không dùng IOptions<EmailSettings>.
    public class ContactMessageService(
        AppDbContext context,
        IEmailService emailService,
        EmailSettings emailSettings) : IContactMessageService
    {
        public async Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto)
        {
            var entity = new ContactMessage
            {
                FullName = dto.FullName.Trim(),
                Email = dto.Email.Trim(),
                Subject = dto.Subject.Trim(),
                Content = dto.Content.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
            };

            context.ContactMessages.Add(entity);
            await context.SaveChangesAsync();

            // Gửi mail thông báo cho admin — không được làm hỏng luồng chính nếu SMTP lỗi/chưa cấu hình
            // (xem EmailService.SendAsync).
            if (!string.IsNullOrWhiteSpace(emailSettings.AdminEmail))
            {
                var subject = $"[Liên hệ] Tin nhắn mới - {entity.Subject}";
                var body = BuildAdminNotificationEmail(entity);
                await emailService.SendAsync(emailSettings.AdminEmail, subject, body);
            }

            return ToDto(entity);
        }

        public async Task<List<ContactMessageDto>> GetAllAsync()
        {
            return await context.ContactMessages
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => ToDto(m))
                .ToListAsync();
        }

        public async Task<ContactMessageDto?> GetByIdAsync(int id)
        {
            var entity = await context.ContactMessages.FindAsync(id);
            return entity is null ? null : ToDto(entity);
        }

        public async Task<ContactMessageDto?> MarkAsReadAsync(int id)
        {
            var entity = await context.ContactMessages.FindAsync(id);
            if (entity is null) return null;

            if (!entity.IsRead)
            {
                entity.IsRead = true;
                await context.SaveChangesAsync();
            }

            return ToDto(entity);
        }

        public async Task<int> GetUnreadCountAsync()
        {
            return await context.ContactMessages.CountAsync(m => !m.IsRead);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await context.ContactMessages.FindAsync(id);
            if (entity is null) return false;

            context.ContactMessages.Remove(entity);
            await context.SaveChangesAsync();
            return true;
        }

        private static ContactMessageDto ToDto(ContactMessage m) => new()
        {
            Id = m.Id,
            FullName = m.FullName,
            Email = m.Email,
            Subject = m.Subject,
            Content = m.Content,
            IsRead = m.IsRead,
            CreatedAt = m.CreatedAt,
        };

        private static string BuildAdminNotificationEmail(ContactMessage m)
        {
            return $"""
                <h3>Có tin nhắn liên hệ mới từ website</h3>
                <p><strong>Họ tên:</strong> {m.FullName}</p>
                <p><strong>Email:</strong> {m.Email}</p>
                <p><strong>Chủ đề:</strong> {m.Subject}</p>
                <p><strong>Nội dung:</strong></p>
                <p>{m.Content}</p>
                <p>Vui lòng vào trang quản trị để xem và phản hồi.</p>
                """;
        }
    }
}
