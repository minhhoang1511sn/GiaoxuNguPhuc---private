using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/clergy-members")]
    [Produces("application/json")]
    public class ClergyMembersController(IClergyMemberService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/clergy-members - Danh sách người đang phục vụ hiện tại (phía trang công khai)</summary>
        [HttpGet]
        public async Task<ActionResult<List<ClergyMemberDto>>> GetCurrent()
        {
            var result = await service.GetCurrentAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/clergy-members/admin - Toàn bộ danh sách (kể cả các niên khóa trước)</summary>
        [HttpGet("admin")]
        public async Task<ActionResult<List<ClergyMemberDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/clergy-members/admin/{id} - Chi tiết một thành viên</summary>
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<ClergyMemberDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy thành viên với id {id}."));

            return Ok(result);
        }

        /// <summary>POST /api/clergy-members/admin - Thêm mới thành viên</summary>
        [HttpPost("admin")]
        public async Task<ActionResult<ClergyMemberDto>> Create([FromBody] CreateClergyMemberDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        /// <summary>PUT /api/clergy-members/admin/{id} - Sửa thông tin thành viên</summary>
        [HttpPut("admin/{id:int}")]
        public async Task<ActionResult<ClergyMemberDto>> Update(int id, [FromBody] UpdateClergyMemberDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.UpdateAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy thành viên với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/clergy-members/admin/{id} - Xoá thành viên</summary>
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy thành viên với id {id}."));

            return NoContent();
        }
    }
}
