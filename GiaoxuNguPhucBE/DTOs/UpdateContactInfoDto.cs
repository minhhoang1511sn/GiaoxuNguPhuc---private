using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin cập nhật thông tin liên hệ giáo xứ</summary>
    public record UpdateContactInfoDto(
        [Required, MinLength(2), MaxLength(200)] string ParishName,
        [Required, MinLength(2), MaxLength(300)] string Address,
        [Required, MinLength(2), MaxLength(30)] string Phone,
        [MaxLength(30)] string? EmergencyPhone,
        [Required, EmailAddress, MaxLength(150)] string Email,
        [MaxLength(300)] string? Facebook,
        [MaxLength(300)] string? Youtube,
        [MaxLength(30)] string? Zalo,
        [MaxLength(1000)] string? MapEmbedUrl,
        [MaxLength(500)] string? MapUrl,
        [MaxLength(500)] string? OfficeHours,
        [MaxLength(1000)] string? MassSchedule
    );
}
