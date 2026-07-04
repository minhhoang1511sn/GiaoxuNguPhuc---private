using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin sửa một mốc lược sử giáo xứ đã có</summary>
    public record UpdateParishHistoryMilestoneDto(
        [Required, MinLength(1), MaxLength(30)] string Year,
        [Required, MinLength(2), MaxLength(200)] string Title,
        [Required, MinLength(2), MaxLength(2000)] string Content,
        [MaxLength(500)] string? ImageUrl,
        int DisplayOrder
    );
}
