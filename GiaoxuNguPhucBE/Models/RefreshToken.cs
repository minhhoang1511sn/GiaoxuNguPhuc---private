using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Refresh token cấp cho 1 phiên đăng nhập của user, dùng để xin AccessToken (JWT) mới
    /// mà không cần đăng nhập lại. Mỗi lần refresh sẽ "xoay vòng" (rotate): token cũ bị thu hồi
    /// và một token mới được cấp — giúp phát hiện trường hợp token bị đánh cắp và tái sử dụng.
    /// </summary>
    public class RefreshToken
    {
        [Key]
        public int Id { get; set; }

        /// <summary>Chuỗi token ngẫu nhiên (không phải JWT), lưu dạng thô để tra cứu khi refresh/logout.</summary>
        [Required]
        public string Token { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User? User { get; set; }

        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>IP tạo ra token này, phục vụ audit khi cần.</summary>
        public string? CreatedByIp { get; set; }

        public DateTime? RevokedAt { get; set; }
        public string? RevokedByIp { get; set; }

        /// <summary>Token mới thay thế token này khi rotate (để dựng lại "chuỗi" token nếu cần điều tra).</summary>
        public string? ReplacedByToken { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
