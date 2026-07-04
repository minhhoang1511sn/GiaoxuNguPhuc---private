using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin sửa thông tin một thành viên đã có</summary>
    public record UpdateClergyMemberDto(
        [Required, MinLength(2), MaxLength(150)] string FullName,
        ClergyType Type,
        [Required, MinLength(2), MaxLength(150)] string Position,
        [MaxLength(150)] string? MinistryName,
        [MaxLength(20)] string? SchoolYear,
        bool IsCurrent,
        [MaxLength(500)] string? ImageUrl,
        [MaxLength(100), EmailAddress] string? Email,
        [MaxLength(30)] string? Phone,
        [MaxLength(500)] string? Description,
        int DisplayOrder
    );
}
