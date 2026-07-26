using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Helpers;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace GiaoxuNguPhucBE.Services
{
    public class AccountService(AppDbContext db, IEmailService emailService, EmailSettings emailSettings) : IAccountService
    {
        // ── Self-service (chính chủ) ─────────────────────────────────────────

        public async Task<UserDto?> GetProfileAsync(int userId)
        {
            var user = await db.Users.FindAsync(userId);
            if (user is null) return null;
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileDto dto)
        {
            var user = await db.Users.FindAsync(userId)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {userId}");

            user.FullName = dto.FullName.Trim();
            user.AvatarUrl = string.IsNullOrWhiteSpace(dto.AvatarUrl) ? null : dto.AvatarUrl.Trim();

            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmNewPassword)
                throw new InvalidOperationException("Mật khẩu xác nhận không khớp");

            var user = await db.Users.FindAsync(userId)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {userId}");

            if (!PasswordHasher.Verify(dto.CurrentPassword, user.PasswordHash, out _))
                throw new InvalidOperationException("Mật khẩu hiện tại không đúng");

            // Đặt mật khẩu mới -> luôn dùng thuật toán hash hiện tại (PBKDF2), bất kể hash cũ
            // đang ở định dạng nào.
            user.PasswordHash = PasswordHasher.Hash(dto.NewPassword);

            // Đổi mật khẩu xong thì thu hồi toàn bộ refresh token đang có — buộc
            // đăng nhập lại ở mọi thiết bị bằng mật khẩu mới, phòng trường hợp
            // mật khẩu cũ đã bị lộ và có phiên đăng nhập trái phép đang tồn tại.
            var activeTokens = await db.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var t in activeTokens)
                t.RevokedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
        }

        // ── Quản trị (Admin) ──────────────────────────────────────────────────

        public async Task<PagedResult<UserDto>> GetUsersAsync(UserQueryParams q)
        {
            var query = db.Users.Include(u => u.Ministry).AsQueryable();

            if (!string.IsNullOrWhiteSpace(q.Search))
                query = query.Where(u =>
                    u.FullName.Contains(q.Search) ||
                    u.Email.Contains(q.Search));

            if (q.Role.HasValue)
                query = query.Where(u => u.Role == q.Role);

            if (q.IsActive.HasValue)
                query = query.Where(u => u.IsActive == q.IsActive);

            if (q.ApprovalStatus.HasValue)
                query = query.Where(u => u.ApprovalStatus == q.ApprovalStatus);

            query = (q.SortBy.ToLower(), q.SortOrder.ToLower()) switch
            {
                ("fullname", "asc")  => query.OrderBy(u => u.FullName),
                ("fullname", _)      => query.OrderByDescending(u => u.FullName),
                ("email", "asc")     => query.OrderBy(u => u.Email),
                ("email", _)         => query.OrderByDescending(u => u.Email),
                ("createdat", "asc") => query.OrderBy(u => u.CreatedAt),
                _                    => query.OrderByDescending(u => u.CreatedAt),
            };

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ToListAsync();

            return new PagedResult<UserDto>(
                items.Select(MapToDto).ToList(),
                totalCount,
                q.Page,
                q.PageSize,
                (int)Math.Ceiling((double)totalCount / q.PageSize)
            );
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await db.Users.Include(u => u.Ministry).FirstOrDefaultAsync(u => u.Id == id);
            return user is null ? null : MapToDto(user);
        }

        public async Task<UserDto> CreateUserAsync(AdminCreateUserDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();
            var exists = await db.Users.AnyAsync(x => x.Email == email);
            if (exists)
                throw new InvalidOperationException("Email đã tồn tại");

            if (dto.MinistryId.HasValue)
            {
                var ministryExists = await db.Ministries.AnyAsync(m => m.Id == dto.MinistryId);
                if (!ministryExists)
                    throw new InvalidOperationException($"Không tìm thấy đoàn thể id {dto.MinistryId}");
            }

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                Email = email,
                PasswordHash = PasswordHasher.Hash(dto.Password),
                Role = dto.Role,
                MinistryId = dto.Role == UserRole.Admin ? null : dto.MinistryId,
                IsActive = true,
                // Admin tự tay tạo tài khoản này -> không cần qua bước tự duyệt.
                ApprovalStatus = UserApprovalStatus.Approved,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task<UserDto> UpdateRoleAsync(int id, UpdateUserRoleDto dto, int currentUserId)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            if (id == currentUserId && dto.Role != UserRole.Admin)
                throw new InvalidOperationException("Không thể tự hạ quyền của chính mình");

            user.Role = dto.Role;

            // Lên Admin thì không còn thuộc đoàn thể nào nữa (Admin quản lý tất cả,
            // không cần/không nên gắn với 1 đoàn thể cụ thể).
            if (dto.Role == UserRole.Admin)
                user.MinistryId = null;

            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task<UserDto> UpdateStatusAsync(int id, UpdateUserStatusDto dto, int currentUserId)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            if (id == currentUserId && !dto.IsActive)
                throw new InvalidOperationException("Không thể tự khoá tài khoản của chính mình");

            user.IsActive = dto.IsActive;

            // Khoá tài khoản thì thu hồi luôn mọi phiên đăng nhập (refresh token) đang có
            if (!dto.IsActive)
            {
                var activeTokens = await db.RefreshTokens
                    .Where(rt => rt.UserId == id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                    .ToListAsync();

                foreach (var t in activeTokens)
                    t.RevokedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task DeleteUserAsync(int id, int currentUserId)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            if (id == currentUserId)
                throw new InvalidOperationException("Không thể tự xoá tài khoản của chính mình");

            var hasPosts = await db.Posts.AnyAsync(p => p.AuthorId == id);
            if (hasPosts)
                throw new InvalidOperationException("Không thể xoá tài khoản đã có bài viết — hãy khoá tài khoản thay vì xoá");

            db.Users.Remove(user);
            await db.SaveChangesAsync();
        }

        public async Task<UserDto> UpdateMinistryAsync(int id, UpdateUserMinistryDto dto)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            if (user.Role == UserRole.Admin)
                throw new InvalidOperationException("Tài khoản Admin không cần gán đoàn thể");

            if (dto.MinistryId.HasValue)
            {
                var ministryExists = await db.Ministries.AnyAsync(m => m.Id == dto.MinistryId);
                if (!ministryExists)
                    throw new ArgumentException($"Không tìm thấy đoàn thể id {dto.MinistryId}");
            }

            user.MinistryId = dto.MinistryId;
            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();
            return MapToDto(user);
        }

        public async Task<AdminResetPasswordResultDto> ResetPasswordAsync(int id, AdminResetPasswordDto dto)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            var newPassword = string.IsNullOrWhiteSpace(dto.NewPassword)
                ? GenerateRandomPassword()
                : dto.NewPassword.Trim();

            user.PasswordHash = PasswordHasher.Hash(newPassword);

            // Đặt mật khẩu mới xong thì thu hồi mọi phiên đăng nhập hiện có, buộc đăng nhập lại
            // bằng mật khẩu mới — giống hành vi tự đổi mật khẩu (ChangePasswordAsync).
            var activeTokens = await db.RefreshTokens
                .Where(rt => rt.UserId == id && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var t in activeTokens)
                t.RevokedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();

            // Gửi mail báo mật khẩu mới cho chính người dùng (nếu SMTP đã cấu hình).
            // Không throw nếu gửi thất bại — Admin vẫn thấy mật khẩu mới trong response để tự gửi thủ công.
            var subject = "[Giáo xứ Ngũ Phúc] Mật khẩu tài khoản của bạn đã được đặt lại";
            var html = $@"
                <p>Xin chào {user.FullName},</p>
                <p>Mật khẩu tài khoản của bạn vừa được Admin đặt lại. Mật khẩu mới của bạn là:</p>
                <p style=""font-size:1.1rem;font-weight:bold;"">{newPassword}</p>
                <p>Vui lòng đăng nhập và đổi lại mật khẩu khác ngay khi có thể.</p>
            ";
            await emailService.SendAsync(user.Email, subject, html);

            return new AdminResetPasswordResultDto(user.Id, user.Email, newPassword);
        }

        public async Task<UserDto> UpdateApprovalAsync(int id, UpdateApprovalStatusDto dto)
        {
            var user = await db.Users.FindAsync(id)
                ?? throw new ArgumentException($"Không tìm thấy tài khoản id {id}");

            user.ApprovalStatus = dto.ApprovalStatus;
            await db.SaveChangesAsync();
            await db.Entry(user).Reference(u => u.Ministry).LoadAsync();

            var subject = dto.ApprovalStatus == UserApprovalStatus.Approved
                ? "[Giáo xứ Ngũ Phúc] Tài khoản của bạn đã được duyệt"
                : "[Giáo xứ Ngũ Phúc] Tài khoản của bạn đã bị từ chối";
            var html = dto.ApprovalStatus == UserApprovalStatus.Approved
                ? $"<p>Xin chào {user.FullName},</p><p>Tài khoản của bạn đã được Admin duyệt. Bạn có thể đăng nhập ngay bây giờ.</p>"
                : $"<p>Xin chào {user.FullName},</p><p>Rất tiếc, yêu cầu đăng ký tài khoản của bạn đã bị từ chối. Vui lòng liên hệ giáo xứ để biết thêm chi tiết.</p>";
            await emailService.SendAsync(user.Email, subject, html);

            return MapToDto(user);
        }

        // ── Helpers ────────────────────────────────────────────────────────────

        // Sinh mật khẩu ngẫu nhiên an toàn, dễ đọc/gõ lại (loại bỏ ký tự dễ nhầm lẫn như 0/O, 1/l/I).
        private static string GenerateRandomPassword(int length = 10)
        {
            const string chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
            var bytes = RandomNumberGenerator.GetBytes(length);
            var sb = new StringBuilder(length);
            foreach (var b in bytes)
                sb.Append(chars[b % chars.Length]);
            return sb.ToString();
        }

        private static UserDto MapToDto(User u) => new(
            u.Id,
            u.FullName,
            u.Email,
            u.AvatarUrl,
            u.Role.ToString(),
            u.MinistryId,
            u.Ministry?.Name,
            u.IsActive,
            u.LastLoginAt,
            u.CreatedAt,
            u.ApprovalStatus.ToString()
        );
    }
}
