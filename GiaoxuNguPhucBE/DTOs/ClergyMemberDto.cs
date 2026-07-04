namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu thành viên ban điều hành trả về cho cả admin và trang công khai</summary>
    public record ClergyMemberDto(
        int Id,
        string FullName,
        int Type,
        string TypeName,
        string Position,
        string? MinistryName,
        string? SchoolYear,
        bool IsCurrent,
        string? ImageUrl,
        string? Email,
        string? Phone,
        string? Description,
        int DisplayOrder,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
