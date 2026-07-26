using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Helpers;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    // Lưu ý: giống MinistryRegistrationService — EmailSettings được đăng ký trong
    // Program.cs bằng builder.Services.AddSingleton(emailSettings) (1 instance cụ thể,
    // không qua IOptions<EmailSettings>), nên phải inject thẳng EmailSettings.
    public class CatechismRegistrationService(
        AppDbContext db,
        IEmailService emailService,
        EmailSettings emailSettings) : ICatechismRegistrationService
    {
        // ── Create ─────────────────────────────────────────────────────────────

        public async Task<CatechismRegistrationDto> CreateAsync(CreateCatechismRegistrationDto dto)
        {
            var now = DateTime.UtcNow;

            var entity = new CatechismRegistration
            {
                FullName = dto.FullName.Trim(),
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                FatherName = dto.FatherName,
                MotherName = dto.MotherName,
                Phone = dto.Phone.Trim(),
                Email = dto.Email,
                Address = dto.Address.Trim(),
                ParishZone = dto.ParishZone,
                ClassType = dto.ClassType,
                SchoolYear = dto.SchoolYear.Trim(),
                IsBaptized = dto.IsBaptized,
                BaptismPlace = dto.BaptismPlace,
                Note = dto.Note,
                Status = RegistrationStatus.Pending,
                CreatedAt = now,
                UpdatedAt = now,
            };

            db.CatechismRegistrations.Add(entity);
            await db.SaveChangesAsync();

            // Gửi mail báo cho người phụ trách (ADMIN_EMAIL) biết có đơn đăng ký giáo lý mới.
            // Không throw nếu gửi mail thất bại (xem EmailService) — đăng ký vẫn phải thành công.
            if (!string.IsNullOrWhiteSpace(emailSettings.AdminEmail))
            {
                var subject = $"[Đăng ký giáo lý] Đơn mới - {EnumLabels.ClassType.GetValueOrDefault(entity.ClassType, entity.ClassType.ToString())}";
                var body = BuildAdminNotificationEmail(entity);
                await emailService.SendAsync(emailSettings.AdminEmail, subject, body);
            }

            return MapToDto(entity);
        }

        // ── GetAll (admin, có lọc + phân trang) ──────────────────────────────────

        public async Task<PagedResult<CatechismRegistrationDto>> GetAllAsync(RegistrationQueryParams q)
        {
            var query = BuildFilteredQuery(q);

            query = (q.SortBy.ToLower(), q.SortOrder.ToLower()) switch
            {
                ("fullname", "asc") => query.OrderBy(r => r.FullName),
                ("fullname", _) => query.OrderByDescending(r => r.FullName),
                ("createdat", "asc") => query.OrderBy(r => r.CreatedAt),
                ("createdat", _) => query.OrderByDescending(r => r.CreatedAt),
                ("status", "asc") => query.OrderBy(r => r.Status),
                ("status", _) => query.OrderByDescending(r => r.Status),
                _ => query.OrderByDescending(r => r.CreatedAt),
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

            var previousStatus = entity.Status;
            entity.Status = dto.Status;
            entity.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            // Chỉ gửi mail cho người đăng ký khi trạng thái thực sự thay đổi và có email
            if (previousStatus != entity.Status && !string.IsNullOrWhiteSpace(entity.Email))
            {
                var (subject, body) = BuildStatusChangeEmail(entity);
                await emailService.SendAsync(entity.Email!, subject, body);
            }

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

        private static string BuildAdminNotificationEmail(CatechismRegistration r)
        {
            var className = EnumLabels.ClassType.GetValueOrDefault(r.ClassType, r.ClassType.ToString());

            return $"""
                <h3>Có đơn đăng ký học giáo lý mới</h3>
                <p><strong>Lớp giáo lý:</strong> {className} (niên khóa {r.SchoolYear})</p>
                <p><strong>Họ tên:</strong> {r.FullName}</p>
                <p><strong>Ngày sinh:</strong> {(r.DateOfBirth.HasValue ? r.DateOfBirth.Value.ToString("dd/MM/yyyy") : "(không có)")}</p>
                <p><strong>Giới tính:</strong> {r.Gender ?? "(không có)"}</p>
                <p><strong>Số điện thoại:</strong> {r.Phone}</p>
                <p><strong>Email:</strong> {r.Email ?? "(không có)"}</p>
                <p><strong>Địa chỉ:</strong> {r.Address}</p>
                <p><strong>Giáo khu:</strong> {r.ParishZone ?? "(không có)"}</p>
                <p><strong>Đã Rửa tội:</strong> {(r.IsBaptized ? "Có" : "Chưa")}{(r.IsBaptized && !string.IsNullOrWhiteSpace(r.BaptismPlace) ? $" — tại {r.BaptismPlace}" : "")}</p>
                <p><strong>Ghi chú:</strong> {r.Note ?? "(không có)"}</p>
                <p><strong>Trạng thái:</strong> Đang chờ duyệt (Pending)</p>
                <p>Vui lòng vào trang quản trị để xem xét và phê duyệt đơn đăng ký này.</p>
                """;
        }

        private static (string Subject, string Body) BuildStatusChangeEmail(CatechismRegistration r)
        {
            var className = EnumLabels.ClassType.GetValueOrDefault(r.ClassType, r.ClassType.ToString());

            if (r.Status == RegistrationStatus.Confirmed)
            {
                return (
                    $"Đơn đăng ký lớp {className} đã được duyệt",
                    $"""
                    <h3>Chúc mừng {r.FullName}!</h3>
                    <p>Đơn đăng ký học <strong>{className}</strong> (niên khóa {r.SchoolYear}) của bạn đã được <strong>phê duyệt</strong>.</p>
                    <p>Ban Giáo lý sẽ liên hệ với bạn qua số điện thoại <strong>{r.Phone}</strong> để hướng dẫn các bước tiếp theo.</p>
                    <p>Cảm ơn bạn đã đăng ký tham gia lớp giáo lý!</p>
                    """
                );
            }

            if (r.Status == RegistrationStatus.Cancelled)
            {
                return (
                    $"Về đơn đăng ký lớp {className}",
                    $"""
                    <p>Chào {r.FullName},</p>
                    <p>Cảm ơn bạn đã quan tâm và đăng ký học <strong>{className}</strong> (niên khóa {r.SchoolYear}).</p>
                    <p>Rất tiếc, đơn đăng ký của bạn hiện chưa được duyệt vào thời điểm này. Bạn có thể liên hệ trực tiếp với Ban Giáo lý để biết thêm chi tiết.</p>
                    """
                );
            }

            return ($"Cập nhật đơn đăng ký lớp {className}", "<p>Trạng thái đơn đăng ký của bạn đã được cập nhật.</p>");
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
