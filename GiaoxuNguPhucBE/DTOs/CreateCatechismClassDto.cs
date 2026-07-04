using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin tạo mới một khóa học</summary>
    public record CreateCatechismClassDto(
        [Required, MinLength(2), MaxLength(150)] string Name,
        [MaxLength(500)] string? Description,
        RegistrationClassType ClassType,
        [MaxLength(20)] string? SchoolYear,
        int DisplayOrder = 0,
        bool IsActive = true
    );
}
