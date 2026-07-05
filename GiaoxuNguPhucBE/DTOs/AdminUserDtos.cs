using System.ComponentModel.DataAnnotations;
using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>POST /api/account (Admin) - Admin tạo tài khoản trực tiếp (ví dụ tài khoản nhân sự/BQT)</summary>
    public record AdminCreateUserDto(
        [Required, MinLength(2), MaxLength(150)] string FullName,
        [Required, EmailAddress] string Email,
        [Required, MinLength(6)] string Password,
        UserRole Role = UserRole.User,
        /// <summary>Đoàn thể gán cho tài khoản (chỉ có ý nghĩa với Role = User)</summary>
        int? MinistryId = null
    );

    /// <summary>PUT /api/account/{id}/role (Admin) - Đổi vai trò tài khoản</summary>
    public record UpdateUserRoleDto(
        UserRole Role
    );

    /// <summary>PUT /api/account/{id}/status (Admin) - Khoá / Mở khoá tài khoản</summary>
    public record UpdateUserStatusDto(
        bool IsActive
    );

    /// <summary>PUT /api/account/{id}/ministry (Admin) - Gán/bỏ gán đoàn thể cho một tài khoản (role User).
    /// Truyền MinistryId = null để bỏ gán (tài khoản sẽ không đăng/quản lý bài viết được nữa).</summary>
    public record UpdateUserMinistryDto(
        int? MinistryId
    );

    /// <summary>PUT /api/account/{id}/approval (Admin) - Duyệt hoặc từ chối tài khoản tự đăng ký
    /// (đang ở trạng thái Pending). Chỉ có ý nghĩa với tài khoản đang chờ duyệt.</summary>
    public record UpdateApprovalStatusDto(
        UserApprovalStatus ApprovalStatus
    );

    /// <summary>PUT /api/account/{id}/reset-password (Admin) - Đặt lại mật khẩu cho 1 tài khoản.
    /// Để trống NewPassword để hệ thống tự sinh mật khẩu ngẫu nhiên.</summary>
    public record AdminResetPasswordDto(
        [MinLength(6)] string? NewPassword = null
    );

    /// <summary>Kết quả đặt lại mật khẩu — trả mật khẩu mới (dạng chữ thường) đúng 1 lần để Admin
    /// gửi lại cho người dùng; server không lưu lại mật khẩu dạng thô sau lần trả về này.</summary>
    public record AdminResetPasswordResultDto(
        int UserId,
        string Email,
        string NewPassword
    );
}
