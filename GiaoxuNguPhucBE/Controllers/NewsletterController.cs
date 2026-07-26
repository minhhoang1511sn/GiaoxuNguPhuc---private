using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Đăng ký nhận tin qua email — khối "Đăng ký nhận tin" ở cuối trang Tin tức
    /// (views/News/News.jsx). Đây là endpoint công khai, ai cũng gọi được, không cần đăng nhập.
    /// </summary>
    [ApiController]
    [Route("api/newsletter")]
    [Produces("application/json")]
    public class NewsletterController(INewsletterService service) : ControllerBase
    {
        /// <summary>POST /api/newsletter/subscribe - Đăng ký nhận tin bằng email (công khai)</summary>
        [HttpPost("subscribe")]
        public async Task<ActionResult> Subscribe([FromBody] SubscribeNewsletterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var isNew = await service.SubscribeAsync(dto);

            // Dù email đã đăng ký từ trước hay vừa đăng ký mới, phía người dùng đều thấy
            // kết quả "đăng ký thành công" — không cần lộ ra là email đã tồn tại trong hệ thống.
            return Ok(new ApiMessage(isNew
                ? "Đăng ký nhận tin thành công."
                : "Email này đã đăng ký nhận tin trước đó."));
        }
    }
}
