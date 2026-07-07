namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Ảnh bìa (banner) của một trang, trả về cho cả trang công khai và quản trị</summary>
    public record PageSettingDto(
        string PageKey,
        string? BannerImageUrl,
        DateTime UpdatedAt
    );
}
