using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        public string? AvatarUrl { get; set; }

        public UserRole Role { get; set; } = UserRole.User;

        /// <summary>Đoàn thể mà tài khoản (role User) trực thuộc — do Admin gán.
        /// Null nghĩa là chưa thuộc đoàn thể nào (chưa được phép đăng bài).
        /// Không áp dụng ý nghĩa gì với tài khoản Admin (Admin quản lý tất cả).</summary>
        public int? MinistryId { get; set; }
        public Ministry? Ministry { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        /// <summary>Tài khoản có được phép đăng nhập hay không. Admin có thể khoá tài khoản
        /// (ví dụ nhân sự nghỉ việc) mà không cần xoá dữ liệu bài viết/bình luận liên quan.</summary>
        public bool IsActive { get; set; } = true;

        /// <summary>Trạng thái duyệt tài khoản tự đăng ký. Tài khoản đăng ký qua form công khai
        /// (/api/auth/register) mặc định ở trạng thái Pending và KHÔNG đăng nhập được cho tới khi
        /// Admin duyệt (Approved). Tài khoản do Admin tạo trực tiếp mặc định Approved.</summary>
        public UserApprovalStatus ApprovalStatus { get; set; } = UserApprovalStatus.Approved;


        /// <summary>Lần đăng nhập gần nhất, phục vụ trang quản lý tài khoản.</summary>
        public DateTime? LastLoginAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
public enum UserRole
{
    User = 0,
    Admin = 1
}
