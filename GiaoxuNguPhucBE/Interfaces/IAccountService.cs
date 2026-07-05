using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Pagination;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IAccountService
    {
        // ── Self-service (chính chủ) ─────────────────────────────────────────
        Task<UserDto?> GetProfileAsync(int userId);
        Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileDto dto);

        /// <exception cref="InvalidOperationException">Mật khẩu hiện tại không đúng, hoặc mật khẩu xác nhận không khớp</exception>
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);

        // ── Quản trị (Admin) ──────────────────────────────────────────────────
        Task<PagedResult<UserDto>> GetUsersAsync(UserQueryParams queryParams);
        Task<UserDto?> GetUserByIdAsync(int id);

        /// <exception cref="InvalidOperationException">Email đã tồn tại</exception>
        Task<UserDto> CreateUserAsync(AdminCreateUserDto dto);

        /// <exception cref="ArgumentException">Không tìm thấy tài khoản</exception>
        Task<UserDto> UpdateRoleAsync(int id, UpdateUserRoleDto dto, int currentUserId);

        /// <exception cref="ArgumentException">Không tìm thấy tài khoản</exception>
        /// <exception cref="InvalidOperationException">Admin không thể tự khoá chính mình</exception>
        Task<UserDto> UpdateStatusAsync(int id, UpdateUserStatusDto dto, int currentUserId);

        /// <exception cref="ArgumentException">Không tìm thấy tài khoản</exception>
        /// <exception cref="InvalidOperationException">Admin không thể tự xoá chính mình, hoặc tài khoản đã có bài viết</exception>
        Task DeleteUserAsync(int id, int currentUserId);

        /// <exception cref="ArgumentException">Không tìm thấy tài khoản, hoặc không tìm thấy đoàn thể</exception>
        Task<UserDto> UpdateMinistryAsync(int id, UpdateUserMinistryDto dto);

        /// <summary>Admin đặt lại mật khẩu cho 1 tài khoản (quên mật khẩu, hỗ trợ người dùng...).
        /// Thu hồi mọi phiên đăng nhập hiện có của tài khoản đó, buộc đăng nhập lại bằng mật khẩu mới.</summary>
        /// <exception cref="ArgumentException">Không tìm thấy tài khoản</exception>
        Task<AdminResetPasswordResultDto> ResetPasswordAsync(int id, AdminResetPasswordDto dto);

        /// <summary>Admin duyệt hoặc từ chối một tài khoản tự đăng ký đang ở trạng thái chờ duyệt (Pending).</summary>
        /// <exception cref="ArgumentException">Không tìm thấy tài khoản</exception>
        Task<UserDto> UpdateApprovalAsync(int id, UpdateApprovalStatusDto dto);
    }
}
