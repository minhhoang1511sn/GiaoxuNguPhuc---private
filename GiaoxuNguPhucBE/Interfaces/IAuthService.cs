using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IAuthService
    {
        /// <summary>Đăng ký tài khoản mới. Tài khoản ở trạng thái CHỜ DUYỆT (Pending) và KHÔNG tự động
        /// đăng nhập — phải chờ Admin duyệt (xem AccountController.UpdateApproval) mới đăng nhập được.
        /// Email thông báo sẽ được gửi cho Admin để duyệt.</summary>
        /// <exception cref="InvalidOperationException">Mật khẩu xác nhận không khớp, hoặc email đã tồn tại</exception>
        Task<RegisterResultDto> RegisterAsync(RegisterRequest request, string? ip);

        /// <summary>Đăng nhập bằng email/mật khẩu, trả về cặp access/refresh token.</summary>
        /// <exception cref="UnauthorizedAccessException">Sai email/mật khẩu, tài khoản đã bị khoá,
        /// đang chờ duyệt, hoặc đã bị từ chối</exception>
        Task<AuthResultDto> LoginAsync(LoginRequest request, string? ip);

        /// <summary>Xoay vòng refresh token: thu hồi token cũ, cấp access token + refresh token mới.</summary>
        /// <exception cref="UnauthorizedAccessException">Refresh token không hợp lệ/đã hết hạn/đã bị thu hồi</exception>
        Task<AuthResultDto> RefreshTokenAsync(string refreshToken, string? ip);

        /// <summary>Đăng xuất: thu hồi refresh token (chỉ token này, các thiết bị khác vẫn còn phiên đăng nhập).</summary>
        Task RevokeRefreshTokenAsync(string refreshToken, string? ip);
    }
}
