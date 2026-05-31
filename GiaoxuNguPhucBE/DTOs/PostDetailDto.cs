namespace GiaoxuNguPhucBE.DTOs
{
    public record PostDetailDto(
    int Id,
    string Title,
    string Excerpt,
    string Content,
    string? ThumbnailUrl,
    string? CoverImageUrl,
    string Status,
    int AuthorId,
    string AuthorName,
    string? AuthorAvatar,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<CommentDto> Comments
);
}
