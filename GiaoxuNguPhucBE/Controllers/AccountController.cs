using System.Security.Claims;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Pagination;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Quản lý tài khoản. Mọi endpoint đều yêu cầu đăng nhập (AccessToken hợp lệ):
    /// - Người dùng thường: chỉ xem/sửa được thông tin của chính mình.
    /// - Admin: xem/tạo/sửa vai trò/khoá-mở khoá/xoá tất cả tài khoản.
    /// </summary>
    [ApiController]
    [Route("api/account")]
    [Produces("application/json")]
    [Authorize]
    public class AccountController(IAccountService accountService) : ControllerBase
    {
        // ── Self-service (chính chủ) ─────────────────────────────────────────

        /// <summary>GET /api/account/me - Thông tin tài khoản của chính mình</summary>
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetMe()
        {
            var profile = await accountService.GetProfileAsync(CurrentUserId);
            if (profile is null)
                return NotFound(new ApiError("Không tìm thấy tài khoản"));

            return Ok(profile);
        }

        /// <summary>PUT /api/account/me - Cập nhật thông tin cá nhân (họ tên, ảnh đại diện)</summary>
        [HttpPut("me")]
        public async Task<ActionResult<UserDto>> UpdateMe([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await accountService.UpdateProfileAsync(CurrentUserId, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/change-password - Tự đổi mật khẩu (thu hồi mọi phiên đăng nhập khác)</summary>
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await accountService.ChangePasswordAsync(CurrentUserId, dto);
                return Ok(new { message = "Đổi mật khẩu thành công, vui lòng đăng nhập lại" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // ── Quản trị (Admin) ──────────────────────────────────────────────────

        /// <summary>GET /api/account - Danh sách tài khoản (phân trang, tìm kiếm, lọc theo vai trò/trạng thái)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDto>>> GetUsers([FromQuery] UserQueryParams queryParams)
        {
            var result = await accountService.GetUsersAsync(queryParams);
            return Ok(result);
        }

        /// <summary>GET /api/account/{id} - Chi tiết 1 tài khoản</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetUser(int id)
        {
            var user = await accountService.GetUserByIdAsync(id);
            if (user is null)
                return NotFound(new ApiError($"Không tìm thấy tài khoản id {id}"));

            return Ok(user);
        }

        /// <summary>POST /api/account - Tạo tài khoản mới (ví dụ tài khoản nhân sự/BQT)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<UserDto>> CreateUser([FromBody] AdminCreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await accountService.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUser), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/{id}/role - Đổi vai trò tài khoản (User/Admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/role")]
        public async Task<ActionResult<UserDto>> UpdateRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            try
            {
                var result = await accountService.UpdateRoleAsync(id, dto, CurrentUserId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/{id}/status - Khoá / Mở khoá tài khoản</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/status")]
        public async Task<ActionResult<UserDto>> UpdateStatus(int id, [FromBody] UpdateUserStatusDto dto)
        {
            try
            {
                var result = await accountService.UpdateStatusAsync(id, dto, CurrentUserId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/{id}/ministry - Gán/bỏ gán đoàn thể cho tài khoản (User quản lý bài viết theo đoàn thể)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/ministry")]
        public async Task<ActionResult<UserDto>> UpdateMinistry(int id, [FromBody] UpdateUserMinistryDto dto)
        {
            try
            {
                var result = await accountService.UpdateMinistryAsync(id, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/{id}/reset-password - Admin đặt lại mật khẩu cho 1 tài khoản
        /// (dùng khi người dùng quên mật khẩu và không tự đổi được). Để trống NewPassword trong body
        /// để hệ thống tự sinh mật khẩu ngẫu nhiên. Mật khẩu mới được trả về đúng 1 lần và cũng được
        /// gửi email cho người dùng (nếu SMTP đã cấu hình).</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/reset-password")]
        public async Task<ActionResult<AdminResetPasswordResultDto>> ResetPassword(int id, [FromBody] AdminResetPasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await accountService.ResetPasswordAsync(id, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/account/{id}/approval - Duyệt hoặc từ chối tài khoản tự đăng ký (Pending)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/approval")]
        public async Task<ActionResult<UserDto>> UpdateApproval(int id, [FromBody] UpdateApprovalStatusDto dto)
        {
            try
            {
                var result = await accountService.UpdateApprovalAsync(id, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
        }

        /// <summary>DELETE /api/account/{id} - Xoá tài khoản (chỉ khi chưa từng đăng bài)</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await accountService.DeleteUserAsync(id, CurrentUserId);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // ── Helper ─────────────────────────────────────────────────────────────

        /// <summary>Lấy Id của tài khoản đang đăng nhập từ claim trong AccessToken</summary>
        private int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}
