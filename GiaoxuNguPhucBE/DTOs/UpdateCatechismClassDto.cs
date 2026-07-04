using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin sửa một khóa học đã có</summary>
    public record UpdateCatechismClassDto(
        [Required, MinLength(2), MaxLength(150)] string Name,
        [MaxLength(500)] string? Description,
        RegistrationClassType ClassType,
        [MaxLength(20)] string? SchoolYear,
        int DisplayOrder,
        bool IsActive
    );
}
