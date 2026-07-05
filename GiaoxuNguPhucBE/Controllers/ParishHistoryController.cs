using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/parish-history")]
    [Produces("application/json")]
    public class ParishHistoryController(IParishHistoryService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/parish-history - Toàn bộ dòng thời gian lược sử giáo xứ (phía trang công khai)</summary>
        [HttpGet]
        public async Task<ActionResult<List<ParishHistoryMilestoneDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/parish-history/admin - Toàn bộ danh sách (dùng cho trang quản trị)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<ParishHistoryMilestoneDto>>> GetAllAdmin()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/parish-history/admin/{id} - Chi tiết một mốc lược sử</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<ParishHistoryMilestoneDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy mốc lược sử với id {id}."));

            return Ok(result);
        }

        /// <summary>POST /api/parish-history/admin - Thêm mới một mốc lược sử</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost("admin")]
        public async Task<ActionResult<ParishHistoryMilestoneDto>> Create([FromBody] CreateParishHistoryMilestoneDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        /// <summary>PUT /api/parish-history/admin/{id} - Sửa một mốc lược sử</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}")]
        public async Task<ActionResult<ParishHistoryMilestoneDto>> Update(int id, [FromBody] UpdateParishHistoryMilestoneDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy mốc lược sử với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/parish-history/admin/{id} - Xoá một mốc lược sử</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy mốc lược sử với id {id}."));

            return NoContent();
        }
    }
}
