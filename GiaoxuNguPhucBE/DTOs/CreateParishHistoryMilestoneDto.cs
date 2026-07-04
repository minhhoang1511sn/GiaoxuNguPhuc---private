using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin thêm mới một mốc lược sử giáo xứ</summary>
    public record CreateParishHistoryMilestoneDto(
        [Required, MinLength(1), MaxLength(30)] string Year,
        [Required, MinLength(2), MaxLength(200)] string Title,
        [Required, MinLength(2), MaxLength(2000)] string Content,
        [MaxLength(500)] string? ImageUrl,
        int DisplayOrder = 0
    );
}
