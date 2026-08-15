using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Tin nhắn / góp ý gửi từ form "Gửi tin nhắn cho chúng tôi" ở trang Liên hệ
    /// (views/Contact/Contact.jsx). POST là endpoint công khai, ai cũng gọi được,
    /// không cần đăng nhập; các endpoint còn lại chỉ dành cho Admin.
    /// </summary>
    [ApiController]
    [Route("api/contact-messages")]
    [Produces("application/json")]
    public class ContactMessagesController(IContactMessageService service) : ControllerBase
    {
        /// <summary>POST /api/contact-messages - Gửi tin nhắn liên hệ (công khai)</summary>
        [HttpPost]
        public async Task<ActionResult<ContactMessageDto>> Create([FromBody] CreateContactMessageDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<ContactMessageDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/contact-messages/admin/unread-count - Số tin nhắn chưa đọc (cho badge)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/unread-count")]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var count = await service.GetUnreadCountAsync();
            return Ok(count);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<ContactMessageDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy tin nhắn với id {id}."));

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}/read")]
        public async Task<ActionResult<ContactMessageDto>> MarkAsRead(int id)
        {
            var result = await service.MarkAsReadAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy tin nhắn với id {id}."));

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy tin nhắn với id {id}."));

            return NoContent();
        }
    }
}
