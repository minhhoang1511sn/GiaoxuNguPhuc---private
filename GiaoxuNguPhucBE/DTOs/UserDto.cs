namespace GiaoxuNguPhucBE.DTOs
{

    public record UserDto(
        int Id,
        string Name,
        string Email,
        string? AvatarUrl,
        string Role,
        DateTime CreatedAt
    );
}
