using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>
    /// Body cho PUT /api/page-settings/{pageKey}. BannerImageUrl là đường dẫn ảnh đã
    /// được upload trước đó qua POST /api/uploads?folder=banners (trả về url), không
    /// phải file — giống pattern ImageUrl của ClergyMember/Ministry.
    /// Truyền null/rỗng để gỡ ảnh bìa, quay về ảnh mặc định phía FE.
    /// </summary>
    public record UpdatePageSettingDto(
        [MaxLength(500)] string? BannerImageUrl
    );
}
