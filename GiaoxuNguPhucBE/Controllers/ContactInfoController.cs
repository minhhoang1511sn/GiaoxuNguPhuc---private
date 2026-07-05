using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Thông tin liên hệ giáo xứ (địa chỉ, điện thoại, email, mạng xã hội, giờ lễ...).
    /// Chỉ có một bản ghi duy nhất — phía công khai chỉ xem, phía admin có thể cập nhật.
    /// Toàn bộ dữ liệu lấy trực tiếp từ DB, không dùng dữ liệu set cứng trong code.
    /// </summary>
    [ApiController]
    [Route("api/contact-info")]
    [Produces("application/json")]
    public class ContactInfoController(IContactInfoService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/contact-info - Thông tin liên hệ giáo xứ (phía trang công khai), lấy từ DB</summary>
        [HttpGet]
        public async Task<ActionResult<ContactInfoDto>> Get()
        {
            var result = await service.GetAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/contact-info/admin - Thông tin liên hệ giáo xứ (dùng cho trang quản trị), lấy từ DB</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<ContactInfoDto>> GetAdmin()
        {
            var result = await service.GetAsync();
            return Ok(result);
        }

        /// <summary>PUT /api/contact-info/admin - Admin cập nhật thông tin liên hệ giáo xứ</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("admin")]
        public async Task<ActionResult<ContactInfoDto>> Update([FromBody] UpdateContactInfoDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(dto);
            return Ok(result);
        }
    }
}
