namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Thông tin công khai của 1 tài khoản — dùng cho login, /account/me, và trang quản lý tài khoản.</summary>
    public record UserDto(
        int Id,
        string FullName,
        string Email,
        string? AvatarUrl,
        string Role,
        int? MinistryId,
        string? MinistryName,
        bool IsActive,
        DateTime? LastLoginAt,
        DateTime CreatedAt,
        string ApprovalStatus
    );
}
