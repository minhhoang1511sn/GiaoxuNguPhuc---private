using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Đăng ký / đăng nhập / làm mới token. Đăng nhập trả về 1 cặp:
    /// - AccessToken (JWT, hạn ngắn) dùng để gọi các API cần xác thực (header Authorization: Bearer ...)
    /// - RefreshToken (chuỗi ngẫu nhiên, hạn dài) dùng để xin AccessToken mới khi hết hạn mà không cần đăng nhập lại.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    [Produces("application/json")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        // ================= REGISTER =================
        /// <summary>POST /api/auth/register - Đăng ký tài khoản mới. Tài khoản ở trạng thái CHỜ DUYỆT,
        /// KHÔNG tự động đăng nhập — Admin sẽ nhận email thông báo để duyệt hoặc từ chối.</summary>
        [HttpPost("register")]
        public async Task<ActionResult<RegisterResultDto>> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await authService.RegisterAsync(request, GetClientIp());
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // ================= LOGIN =================
        /// <summary>POST /api/auth/login - Đăng nhập bằng email/mật khẩu</summary>
        [HttpPost("login")]
        public async Task<ActionResult<AuthResultDto>> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await authService.LoginAsync(request, GetClientIp());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiError(ex.Message));
            }
        }

        // ================= REFRESH =================
        /// <summary>POST /api/auth/refresh - Dùng RefreshToken để xin cặp AccessToken/RefreshToken mới (xoay vòng)</summary>
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthResultDto>> Refresh([FromBody] RefreshTokenRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await authService.RefreshTokenAsync(request.RefreshToken, GetClientIp());
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new ApiError(ex.Message));
            }
        }

        // ================= LOGOUT =================
        /// <summary>POST /api/auth/logout - Thu hồi RefreshToken hiện tại (đăng xuất khỏi thiết bị này)</summary>
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto request)
        {
            await authService.RevokeRefreshTokenAsync(request.RefreshToken, GetClientIp());
            return Ok(new { message = "Đã đăng xuất" });
        }

        // ================= HELPER =================
        private string? GetClientIp() => HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
