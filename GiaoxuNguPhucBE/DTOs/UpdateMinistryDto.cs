using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin sửa một đoàn thể đã có</summary>
    public record UpdateMinistryDto(
        [Required, MinLength(2), MaxLength(150)] string Name,
        MinistryCategory Category,
        [MaxLength(50)] string? CategoryLabel,
        [Required, MinLength(2), MaxLength(1000)] string Description,
        [MaxLength(500)] string? ImageUrl,
        [MaxLength(10)] string? Icon,
        int DisplayOrder,
        bool IsActive
    );
}
