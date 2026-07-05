using System.Security.Cryptography;
using System.Text;
using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class AuthService(AppDbContext db, ITokenService tokenService, IEmailService emailService, EmailSettings emailSettings) : IAuthService
    {
        // ================= REGISTER =================
        public async Task<RegisterResultDto> RegisterAsync(RegisterRequest request, string? ip)
        {
            if (request.Password != request.ConfirmPassword)
                throw new InvalidOperationException("Mật khẩu không khớp");

            var email = request.Email.Trim().ToLowerInvariant();
            var exists = await db.Users.AnyAsync(x => x.Email == email);
            if (exists)
                throw new InvalidOperationException("Email đã tồn tại");

            var user = new User
            {
                FullName = request.FullName.Trim(),
                Email = email,
                PasswordHash = HashPassword(request.Password),
                Role = UserRole.User,
                IsActive = true,
                // Tài khoản tự đăng ký phải chờ Admin duyệt mới đăng nhập được.
                ApprovalStatus = UserApprovalStatus.Pending,
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            await NotifyAdminNewRegistrationAsync(user);

            return new RegisterResultDto(
                "Đăng ký thành công. Tài khoản của bạn đang chờ Admin duyệt, vui lòng chờ email/thông báo xác nhận trước khi đăng nhập.",
                MapToDto(user)
            );
        }

        // ================= LOGIN =================
        public async Task<AuthResultDto> LoginAsync(LoginRequest request, string? ip)
        {
            var email = request.Email.Trim().ToLowerInvariant();
            var user = await db.Users.Include(u => u.Ministry).FirstOrDefaultAsync(x => x.Email == email);

            if (user == null || user.PasswordHash != HashPassword(request.Password))
                throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

            if (user.ApprovalStatus == UserApprovalStatus.Pending)
                throw new UnauthorizedAccessException("Tài khoản đang chờ Admin duyệt, vui lòng quay lại sau");

            if (user.ApprovalStatus == UserApprovalStatus.Rejected)
                throw new UnauthorizedAccessException("Tài khoản đã bị từ chối, vui lòng liên hệ Admin để biết thêm chi tiết");

            if (!user.IsActive)
                throw new UnauthorizedAccessException("Tài khoản đã bị khoá");

            user.LastLoginAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return await IssueTokensAsync(user, ip);
        }

        // ================= REFRESH TOKEN (rotate) =================
        public async Task<AuthResultDto> RefreshTokenAsync(string refreshToken, string? ip)
        {
            var existing = await db.RefreshTokens
                .Include(rt => rt.User)
                    .ThenInclude(u => u!.Ministry)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (existing is null)
                throw new UnauthorizedAccessException("Refresh token không hợp lệ");

            if (!existing.IsActive)
            {
                // Refresh token đã bị thu hồi/hết hạn nhưng vẫn bị đem ra dùng lại
                // => dấu hiệu token có thể đã bị đánh cắp. Thu hồi luôn toàn bộ
                // refresh token còn hiệu lực của user này để buộc đăng nhập lại ở mọi thiết bị.
                if (existing.IsRevoked)
                    await RevokeAllActiveTokensAsync(existing.UserId, ip);

                throw new UnauthorizedAccessException("Refresh token đã hết hạn hoặc đã bị thu hồi");
            }

            var user = existing.User ?? await db.Users.Include(u => u.Ministry).FirstOrDefaultAsync(u => u.Id == existing.UserId);
            if (user is null || !user.IsActive)
                throw new UnauthorizedAccessException("Tài khoản không tồn tại hoặc đã bị khoá");

            // Rotate: thu hồi token cũ, cấp token mới
            var newRefreshTokenValue = tokenService.GenerateRefreshTokenValue();
            var newRefreshTokenExpiry = tokenService.GetRefreshTokenExpiry();

            existing.RevokedAt = DateTime.UtcNow;
            existing.RevokedByIp = ip;
            existing.ReplacedByToken = newRefreshTokenValue;

            db.RefreshTokens.Add(new RefreshToken
            {
                Token = newRefreshTokenValue,
                UserId = user.Id,
                ExpiresAt = newRefreshTokenExpiry,
                CreatedByIp = ip,
            });

            await db.SaveChangesAsync();

            var accessToken = tokenService.GenerateAccessToken(user);
            return new AuthResultDto(
                accessToken,
                tokenService.GetAccessTokenExpiry(),
                newRefreshTokenValue,
                newRefreshTokenExpiry,
                MapToDto(user)
            );
        }

        // ================= LOGOUT =================
        public async Task RevokeRefreshTokenAsync(string refreshToken, string? ip)
        {
            var existing = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
            if (existing is null || !existing.IsActive)
                return; // đã thu hồi/không tồn tại — coi như logout thành công (idempotent)

            existing.RevokedAt = DateTime.UtcNow;
            existing.RevokedByIp = ip;
            await db.SaveChangesAsync();
        }

        // ================= HELPERS =================
        private async Task<AuthResultDto> IssueTokensAsync(User user, string? ip)
        {
            var accessToken = tokenService.GenerateAccessToken(user);
            var refreshTokenValue = tokenService.GenerateRefreshTokenValue();
            var refreshTokenExpiry = tokenService.GetRefreshTokenExpiry();

            db.RefreshTokens.Add(new RefreshToken
            {
                Token = refreshTokenValue,
                UserId = user.Id,
                ExpiresAt = refreshTokenExpiry,
                CreatedByIp = ip,
            });
            await db.SaveChangesAsync();

            return new AuthResultDto(
                accessToken,
                tokenService.GetAccessTokenExpiry(),
                refreshTokenValue,
                refreshTokenExpiry,
                MapToDto(user)
            );
        }

        private async Task RevokeAllActiveTokensAsync(int userId, string? ip)
        {
            var tokens = await db.RefreshTokens
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var t in tokens)
            {
                t.RevokedAt = DateTime.UtcNow;
                t.RevokedByIp = ip;
            }

            if (tokens.Count > 0)
                await db.SaveChangesAsync();
        }

        // Giữ nguyên thuật toán hash (SHA256) đã dùng từ trước để không phá vỡ mật khẩu
        // của các tài khoản đã đăng ký trước đây.
        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        // Gửi email báo cho Admin biết có tài khoản mới đăng ký đang chờ duyệt.
        // Không throw nếu gửi mail thất bại (xem EmailService) — đăng ký vẫn phải thành công.
        private async Task NotifyAdminNewRegistrationAsync(User user)
        {
            if (string.IsNullOrWhiteSpace(emailSettings.AdminEmail))
                return;

            var approveUrl = $"{emailSettings.FrontendUrl.TrimEnd('/')}/admin/accounts";
            var subject = "[Giáo xứ Ngũ Phúc] Có tài khoản mới đăng ký chờ duyệt";
            var html = $@"
                <p>Xin chào Admin,</p>
                <p>Có một tài khoản mới vừa đăng ký trên website và đang chờ được duyệt:</p>
                <ul>
                    <li><strong>Họ tên:</strong> {user.FullName}</li>
                    <li><strong>Email:</strong> {user.Email}</li>
                    <li><strong>Thời gian đăng ký:</strong> {user.CreatedAt:dd/MM/yyyy HH:mm}</li>
                </ul>
                <p>Vui lòng vào trang quản trị để duyệt hoặc từ chối tài khoản này:</p>
                <p><a href=""{approveUrl}"">{approveUrl}</a></p>
                <p>Tài khoản sẽ KHÔNG thể đăng nhập cho tới khi được duyệt.</p>
            ";

            await emailService.SendAsync(emailSettings.AdminEmail, subject, html);
        }

        internal static UserDto MapToDto(User u) => new(
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
