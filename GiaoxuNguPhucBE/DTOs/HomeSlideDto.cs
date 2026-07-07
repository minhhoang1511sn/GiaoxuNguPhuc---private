namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Một ảnh trong slideshow trang chủ, trả về cho cả trang công khai và quản trị</summary>
    public record HomeSlideDto(
        int Id,
        string ImageUrl,
        int DisplayOrder,
        DateTime CreatedAt
    );
}
