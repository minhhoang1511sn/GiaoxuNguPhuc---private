using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Helpers;
using GiaoxuNguPhucBE.Models;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Nguồn dữ liệu duy nhất cho các danh sách enum (loại lớp, chuyên mục bài viết,
    /// trạng thái bài viết, loại đoàn thể, chức vụ giáo sĩ, trạng thái đăng ký...).
    /// Frontend fetch từ đây thay vì viết cứng — đổi/thêm nhãn chỉ cần sửa Helpers/EnumLabels.cs.
    /// </summary>
    [ApiController]
    [Route("api/meta")]
    [Produces("application/json")]
    public class MetaController : ControllerBase
    {
        /// <summary>GET /api/meta/enums - Toàn bộ danh sách enum dùng cho dropdown/filter ở admin</summary>
        [HttpGet("enums")]
        public ActionResult<EnumsMetaDto> GetEnums()
        {
            var result = new EnumsMetaDto(
                ClassTypes: EnumLabels.ToOptions(EnumLabels.ClassType),
                PostCategories: EnumLabels.ToOptions(EnumLabels.PostCategory),
                PostStatuses: EnumLabels.ToOptions(EnumLabels.PostStatus),
                MinistryCategories: EnumLabels.ToOptions(EnumLabels.MinistryCategory),
                ClergyTypes: EnumLabels.ToOptions(EnumLabels.ClergyType),
                RegistrationStatuses: EnumLabels.ToOptions(EnumLabels.RegistrationStatus),
                UserApprovalStatuses: EnumLabels.ToOptions(EnumLabels.UserApprovalStatus)
            );

            return Ok(result);
        }
    }
}
