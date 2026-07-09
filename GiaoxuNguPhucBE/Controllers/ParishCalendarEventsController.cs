using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/parish-calendar-events")]
    [Produces("application/json")]
    public class ParishCalendarEventsController(IParishCalendarEventService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/parish-calendar-events?year=2026&month=7 - Sự kiện trong tháng (phía trang công khai, Lịch Phụng vụ)</summary>
        [HttpGet]
        public async Task<ActionResult<List<ParishCalendarEventResponseDto>>> GetPublic([FromQuery] int year, [FromQuery] int month)
        {
            var result = await service.GetByMonthAsync(year, month);
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────
        //
        // LƯU Ý BẢO MẬT: các endpoint dưới đây trước kia KHÔNG có [Authorize] —
        // bất kỳ ai (kể cả chưa đăng nhập) đều có thể tạo/sửa/xoá sự kiện lịch
        // giáo xứ. Đã bổ sung [Authorize(Roles = "Admin")] để khớp với mọi
        // controller quản trị khác trong project (ClergyMembers, Ministries...).

        /// <summary>GET /api/parish-calendar-events/admin?year=2026&month=7 - Toàn bộ sự kiện trong tháng (trang quản trị)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<ParishCalendarEventResponseDto>>> GetAdmin([FromQuery] int year, [FromQuery] int month)
        {
            var result = await service.GetByMonthAsync(year, month);
            return Ok(result);
        }

        /// <summary>POST /api/parish-calendar-events/admin - Thêm mới sự kiện</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("admin")]
        public async Task<ActionResult<ParishCalendarEventResponseDto>> Create([FromBody] ParishCalendarEventDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetAdmin), new { year = result.EventDate.Year, month = result.EventDate.Month }, result);
        }

        /// <summary>PUT /api/parish-calendar-events/admin/{id} - Sửa sự kiện</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}")]
        public async Task<ActionResult<ParishCalendarEventResponseDto>> Update(int id, [FromBody] ParishCalendarEventDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy sự kiện với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/parish-calendar-events/admin/{id} - Xoá sự kiện</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy sự kiện với id {id}."));

            return NoContent();
        }
    }
}
