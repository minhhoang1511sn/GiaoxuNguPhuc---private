using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/ministries")]
    [Produces("application/json")]
    public class MinistriesController(IMinistryService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/ministries - Danh sách đoàn thể đang hoạt động (phía trang công khai)</summary>
        [HttpGet]
        public async Task<ActionResult<List<MinistryDto>>> GetActive()
        {
            var result = await service.GetActiveAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/ministries/admin - Toàn bộ danh sách (kể cả ngưng hoạt động)</summary>
        [HttpGet("admin")]
        public async Task<ActionResult<List<MinistryDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/ministries/admin/{id} - Chi tiết một đoàn thể</summary>
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<MinistryDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đoàn thể với id {id}."));

            return Ok(result);
        }

        /// <summary>POST /api/ministries/admin - Thêm mới đoàn thể</summary>
        [HttpPost("admin")]
        public async Task<ActionResult<MinistryDto>> Create([FromBody] CreateMinistryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        /// <summary>PUT /api/ministries/admin/{id} - Sửa thông tin đoàn thể</summary>
        [HttpPut("admin/{id:int}")]
        public async Task<ActionResult<MinistryDto>> Update(int id, [FromBody] UpdateMinistryDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đoàn thể với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/ministries/admin/{id} - Xoá đoàn thể</summary>
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy đoàn thể với id {id}."));

            return NoContent();
        }
    }
}
