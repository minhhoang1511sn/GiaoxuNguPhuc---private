using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Ảnh bìa (banner) cho từng trang công khai (Về Giáo Xứ, Các Giới & Hội Đoàn, Tin Tức,
    /// Đăng Ký Giáo Lý, Liên Hệ...).
    /// Phía công khai chỉ xem, admin cập nhật trong trang quản trị "Quản lý Ảnh nền (Banner)".
    /// Ảnh thực tế được upload trước qua POST /api/uploads?folder=banners, controller này
    /// chỉ lưu/trả về đường dẫn ảnh đã upload — giống pattern ImageUrl của Ministry/ClergyMember.
    /// </summary>
    [ApiController]
    [Route("api/page-settings")]
    [Produces("application/json")]
    public class PageSettingsController(IPageSettingService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/page-settings/{pageKey} - Ảnh bìa hiện tại của trang (phía trang công khai), lấy từ DB</summary>
        [HttpGet("{pageKey}")]
        public async Task<ActionResult<PageSettingDto>> Get(string pageKey)
        {
            if (string.IsNullOrWhiteSpace(pageKey))
                return BadRequest(new ApiError("Thiếu mã trang (pageKey)."));

            var result = await service.GetAsync(pageKey);
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/page-settings - Ảnh bìa của tất cả các trang đã cấu hình (dùng cho trang quản trị)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<PageSettingDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>PUT /api/page-settings/{pageKey} - Admin cập nhật ảnh bìa của một trang</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("{pageKey}")]
        public async Task<ActionResult<PageSettingDto>> Update(string pageKey, [FromBody] UpdatePageSettingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(pageKey, dto);
            if (result is null)
                return BadRequest(new ApiError("Mã trang không hợp lệ."));

            return Ok(result);
        }
    }
}
