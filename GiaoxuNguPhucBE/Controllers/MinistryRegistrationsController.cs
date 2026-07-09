using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/ministry-registrations")]
    [Produces("application/json")]
    public class MinistryRegistrationsController(IMinistryRegistrationService service) : ControllerBase
    {
        /// <summary>POST /api/ministry-registrations - Đăng ký tham gia đoàn thể (công khai)</summary>
        [HttpPost]
        public async Task<ActionResult<MinistryRegistrationDto>> Create([FromBody] CreateMinistryRegistrationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            if (result is null)
                return BadRequest(new ApiError("Đoàn thể không tồn tại."));

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<MinistryRegistrationDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        /// <summary>GET /api/ministry-registrations/admin/counts - Đếm số đơn theo từng đoàn thể (tổng + đang chờ)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/counts")]
        public async Task<ActionResult<List<MinistryRegistrationCountDto>>> GetCounts()
        {
            var result = await service.GetCountsAsync();
            return Ok(result);
        }

        /// <summary>GET /api/ministry-registrations/admin/by-ministry/{ministryId} - Danh sách đơn của 1 đoàn thể</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/by-ministry/{ministryId:int}")]
        public async Task<ActionResult<List<MinistryRegistrationDto>>> GetByMinistry(int ministryId)
        {
            var result = await service.GetByMinistryIdAsync(ministryId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<MinistryRegistrationDto>> GetById(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}/status")]
        public async Task<ActionResult<MinistryRegistrationDto>> UpdateStatus(int id, [FromBody] UpdateRegistrationStatusDto dto)
        {
            var result = await service.UpdateStatusAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return NoContent();
        }
    }
}