namespace GiaoxuNguPhucBE.DTOs
{
    public record PostListDto(
    int Id,
    string Title,
    string Excerpt,
    string? ThumbnailUrl,
    string Status,
    string AuthorName,
    string? AuthorAvatar,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int CommentCount
);
}
