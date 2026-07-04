namespace GiaoxuNguPhucBE.DTOs
{
    public record CatechismRegistrationDto(
        int Id,
        string FullName,
        DateTime? DateOfBirth,
        string? Gender,
        string? FatherName,
        string? MotherName,
        string Phone,
        string? Email,
        string Address,
        string? ParishZone,
        string ClassType,
        string SchoolYear,
        bool IsBaptized,
        string? BaptismPlace,
        string? Note,
        string Status,
        DateTime CreatedAt,
        DateTime UpdatedAt
    );
}
