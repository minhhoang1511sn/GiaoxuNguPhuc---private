using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>
    /// Admin thêm mới một ảnh slideshow trang chủ. ImageUrl là đường dẫn ảnh đã
    /// upload trước đó qua POST /api/uploads?folder=banners (trả về url), không
    /// phải file — giống pattern ImageUrl của ClergyMember/Ministry.
    /// </summary>
    public record CreateHomeSlideDto(
        [Required, MaxLength(500)] string ImageUrl,
        int DisplayOrder = 0
    );
}
