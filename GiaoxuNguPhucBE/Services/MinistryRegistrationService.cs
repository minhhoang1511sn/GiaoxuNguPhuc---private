using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    // Lưu ý: EmailSettings được đăng ký trong Program.cs bằng
    // builder.Services.AddSingleton(emailSettings) — tức là 1 instance cụ thể,
    // KHÔNG phải qua Configure<EmailSettings>()/AddOptions(). Vì vậy phải inject
    // thẳng EmailSettings (giống EmailService), không dùng IOptions<EmailSettings>
    // (sẽ không resolve được và gây lỗi 500 ngay khi có request đầu tiên).
    public class MinistryRegistrationService(
        AppDbContext context,
        IEmailService emailService,
        EmailSettings emailSettings) : IMinistryRegistrationService
    {
        private readonly EmailSettings _emailSettings = emailSettings;

        public async Task<MinistryRegistrationDto?> CreateAsync(CreateMinistryRegistrationDto dto)
        {
            var ministry = await context.Ministries.FirstOrDefaultAsync(m => m.Id == dto.MinistryId);
            if (ministry is null) return null;

            var entity = new MinistryRegistration
            {
                MinistryId = dto.MinistryId,
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone.Trim(),
                Email = dto.Email?.Trim(),
                DateOfBirth = dto.DateOfBirth,
                Note = dto.Note?.Trim(),
                Status = RegistrationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            context.MinistryRegistrations.Add(entity);
            await context.SaveChangesAsync();

            // Gửi mail thông báo cho admin về đơn đăng ký mới (Pending)
            if (!string.IsNullOrWhiteSpace(_emailSettings.AdminEmail))
            {
                var subject = $"[Đăng ký đoàn thể] Đơn mới - {ministry.Name}";
                var body = BuildAdminNotificationEmail(entity, ministry.Name);
                await emailService.SendAsync(_emailSettings.AdminEmail, subject, body);
            }

            return await GetByIdAsync(entity.Id);
        }

        public async Task<List<MinistryRegistrationDto>> GetAllAsync()
        {
            return await context.MinistryRegistrations
                .Include(r => r.Ministry)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => ToDto(r))
                .ToListAsync();
        }

        public async Task<MinistryRegistrationDto?> GetByIdAsync(int id)
        {
            var entity = await context.MinistryRegistrations
                .Include(r => r.Ministry)
                .FirstOrDefaultAsync(r => r.Id == id);

            return entity is null ? null : ToDto(entity);
        }

        public async Task<MinistryRegistrationDto?> UpdateStatusAsync(int id, UpdateRegistrationStatusDto dto)
        {
            var entity = await context.MinistryRegistrations
                .Include(r => r.Ministry)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (entity is null) return null;

            var previousStatus = entity.Status;
            entity.Status = dto.Status;
            await context.SaveChangesAsync();

            // Chỉ gửi mail cho người đăng ký khi trạng thái thực sự thay đổi và có email
            if (previousStatus != entity.Status && !string.IsNullOrWhiteSpace(entity.Email))
            {
                var (subject, body) = BuildStatusChangeEmail(entity);
                await emailService.SendAsync(entity.Email, subject, body);
            }

            return ToDto(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await context.MinistryRegistrations.FindAsync(id);
            if (entity is null) return false;

            context.MinistryRegistrations.Remove(entity);
            await context.SaveChangesAsync();
            return true;
        }

        private static MinistryRegistrationDto ToDto(MinistryRegistration r) => new()
        {
            Id = r.Id,
            MinistryId = r.MinistryId,
            MinistryName = r.Ministry?.Name ?? "",
            FullName = r.FullName,
            Phone = r.Phone,
            Email = r.Email,
            DateOfBirth = r.DateOfBirth,
            Note = r.Note,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        };

        private static string BuildAdminNotificationEmail(MinistryRegistration r, string ministryName)
        {
            return $"""
                <h3>Có đơn đăng ký tham gia đoàn thể mới</h3>
                <p><strong>Đoàn thể:</strong> {ministryName}</p>
                <p><strong>Họ tên:</strong> {r.FullName}</p>
                <p><strong>Số điện thoại:</strong> {r.Phone}</p>
                <p><strong>Email:</strong> {r.Email ?? "(không có)"}</p>
                <p><strong>Ngày sinh:</strong> {(r.DateOfBirth.HasValue ? r.DateOfBirth.Value.ToString("dd/MM/yyyy") : "(không có)")}</p>
                <p><strong>Ghi chú:</strong> {r.Note ?? "(không có)"}</p>
                <p><strong>Trạng thái:</strong> Đang chờ duyệt (Pending)</p>
                <p>Vui lòng vào trang quản trị để xem xét và phê duyệt đơn đăng ký này.</p>
                """;
        }

        private static (string Subject, string Body) BuildStatusChangeEmail(MinistryRegistration r)
        {
            var ministryName = r.Ministry?.Name ?? "";

            if (r.Status == RegistrationStatus.Confirmed)
            {
                return (
                    $"Đơn đăng ký tham gia {ministryName} đã được duyệt",
                    $"""
                    <h3>Chúc mừng {r.FullName}!</h3>
                    <p>Đơn đăng ký tham gia đoàn thể <strong>{ministryName}</strong> của bạn đã được <strong>phê duyệt</strong>.</p>
                    <p>Ban phụ trách sẽ liên hệ với bạn qua số điện thoại <strong>{r.Phone}</strong> để hướng dẫn các bước tiếp theo.</p>
                    <p>Cảm ơn bạn đã đăng ký tham gia phục vụ cộng đoàn!</p>
                    """
                );
            }

            if (r.Status == RegistrationStatus.Cancelled)
            {
                return (
                    $"Về đơn đăng ký tham gia {ministryName}",
                    $"""
                    <p>Chào {r.FullName},</p>
                    <p>Cảm ơn bạn đã quan tâm và đăng ký tham gia đoàn thể <strong>{ministryName}</strong>.</p>
                    <p>Rất tiếc, đơn đăng ký của bạn hiện chưa được duyệt vào thời điểm này. Bạn có thể liên hệ trực tiếp với Ban phụ trách để biết thêm chi tiết.</p>
                    """
                );
            }

            return ($"Cập nhật đơn đăng ký {ministryName}", "<p>Trạng thái đơn đăng ký của bạn đã được cập nhật.</p>");
        }

        public async Task<List<MinistryRegistrationDto>> GetByMinistryIdAsync(int ministryId)
        {
            return await context.MinistryRegistrations
                .Include(r => r.Ministry)
                .Where(r => r.MinistryId == ministryId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => ToDto(r))
                .ToListAsync();
        }

        public async Task<List<MinistryRegistrationCountDto>> GetCountsAsync()
        {
            return await context.MinistryRegistrations
                .GroupBy(r => r.MinistryId)
                .Select(g => new MinistryRegistrationCountDto
                {
                    MinistryId = g.Key,
                    Total = g.Count(),
                    Pending = g.Count(r => r.Status == RegistrationStatus.Pending)
                })
                .ToListAsync();
        }
    }


}