using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/catechism-classes")]
    [Produces("application/json")]
    public class CatechismClassesController(ICatechismClassService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/catechism-classes - Danh sách khóa học đang mở (phía trang đăng ký)</summary>
        [HttpGet]
        public async Task<ActionResult<List<CatechismClassDto>>> GetActive()
        {
            var result = await service.GetActiveAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/catechism-classes/admin - Toàn bộ danh sách khóa học (kể cả đang ẩn)</summary>
        [HttpGet("admin")]
        public async Task<ActionResult<List<CatechismClassDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/catechism-classes/admin/{id} - Chi tiết một khóa học</summary>
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<CatechismClassDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy khóa học với id {id}."));

            return Ok(result);
        }

        /// <summary>POST /api/catechism-classes/admin - Thêm mới khóa học</summary>
        [HttpPost("admin")]
        public async Task<ActionResult<CatechismClassDto>> Create([FromBody] CreateCatechismClassDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        /// <summary>PUT /api/catechism-classes/admin/{id} - Sửa thông tin khóa học</summary>
        [HttpPut("admin/{id:int}")]
        public async Task<ActionResult<CatechismClassDto>> Update(int id, [FromBody] UpdateCatechismClassDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy khóa học với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/catechism-classes/admin/{id} - Xoá khóa học</summary>
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy khóa học với id {id}."));

            return NoContent();
        }
    }
}
