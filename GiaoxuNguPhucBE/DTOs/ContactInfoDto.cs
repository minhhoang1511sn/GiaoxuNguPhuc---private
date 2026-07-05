namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Thông tin liên hệ giáo xứ trả về cho cả admin và trang công khai</summary>
    public record ContactInfoDto(
        int Id,
        string ParishName,
        string Address,
        string Phone,
        string? EmergencyPhone,
        string Email,
        string? Facebook,
        string? Youtube,
        string? Zalo,
        string? MapEmbedUrl,
        string? MapUrl,
        string? OfficeHours,
        string? MassSchedule,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
