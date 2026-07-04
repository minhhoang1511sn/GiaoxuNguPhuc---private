namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu khóa học trả về cho cả admin và trang đăng ký công khai</summary>
    public record CatechismClassDto(
        int Id,
        string Name,
        string? Description,
        int ClassType,
        string ClassTypeName,
        string? SchoolYear,
        int DisplayOrder,
        bool IsActive,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
