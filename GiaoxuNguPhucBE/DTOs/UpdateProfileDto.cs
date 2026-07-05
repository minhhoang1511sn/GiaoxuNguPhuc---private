using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>PUT /api/account/me - Người dùng tự cập nhật thông tin cá nhân</summary>
    public record UpdateProfileDto(
        [Required, MinLength(2), MaxLength(150)] string FullName,
        string? AvatarUrl
    );

    /// <summary>PUT /api/account/change-password - Người dùng tự đổi mật khẩu</summary>
    public record ChangePasswordDto(
        [Required] string CurrentPassword,
        [Required, MinLength(6)] string NewPassword,
        [Required] string ConfirmNewPassword
    );
}
