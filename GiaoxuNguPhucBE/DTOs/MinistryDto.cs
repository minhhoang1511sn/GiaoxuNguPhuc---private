namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu một đoàn thể trả về cho cả admin và trang công khai</summary>
    public record MinistryDto(
        int Id,
        string Name,
        int Category,
        string CategoryName,
        string? CategoryLabel,
        string Description,
        string? ImageUrl,
        string? Icon,
        int DisplayOrder,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
