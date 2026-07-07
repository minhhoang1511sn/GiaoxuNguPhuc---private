using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Ảnh slideshow (banner trượt tự động) ở đầu trang chủ. Phía công khai chỉ
    /// xem, admin thêm/xoá/sắp xếp lại trong trang quản trị "Quản lý Ảnh nền
    /// (Banner)" — mục "Slideshow trang chủ". Ảnh thực tế được upload trước qua
    /// POST /api/uploads?folder=banners, controller này chỉ lưu/trả về đường dẫn
    /// ảnh đã upload — giống pattern ImageUrl của Ministry/ClergyMember.
    /// </summary>
    [ApiController]
    [Route("api/home-slides")]
    [Produces("application/json")]
    public class HomeSlidesController(IHomeSlideService service) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>GET /api/home-slides - Toàn bộ ảnh slideshow trang chủ, sắp theo thứ tự hiển thị (phía trang công khai)</summary>
        [HttpGet]
        public async Task<ActionResult<List<HomeSlideDto>>> GetAll()
        {
            var result = await service.GetAllAsync();
            return Ok(result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>POST /api/home-slides (Admin) - Thêm mới một ảnh vào slideshow trang chủ</summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<HomeSlideDto>> Create([FromBody] CreateHomeSlideDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return Ok(result);
        }

        /// <summary>DELETE /api/home-slides/{id} (Admin) - Xoá một ảnh khỏi slideshow trang chủ</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy ảnh slideshow với id {id}."));

            return NoContent();
        }

        /// <summary>PUT /api/home-slides/reorder (Admin) - Sắp xếp lại thứ tự hiển thị các ảnh slideshow</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("reorder")]
        public async Task<ActionResult<List<HomeSlideDto>>> Reorder([FromBody] ReorderHomeSlidesDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var ok = await service.ReorderAsync(dto);
            if (!ok)
                return BadRequest(new ApiError("Danh sách Id không khớp với dữ liệu slideshow hiện có."));

            var result = await service.GetAllAsync();
            return Ok(result);
        }
    }
}
