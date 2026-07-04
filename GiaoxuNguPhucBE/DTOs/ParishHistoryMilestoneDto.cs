namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu một mốc lược sử giáo xứ trả về cho cả admin và trang công khai</summary>
    public record ParishHistoryMilestoneDto(
        int Id,
        string Year,
        string Title,
        string Content,
        string? ImageUrl,
        int DisplayOrder,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
