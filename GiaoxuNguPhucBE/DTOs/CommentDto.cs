namespace GiaoxuNguPhucBE.DTOs
{
    public record CommentDto(
    int Id,
    string Content,
    string AuthorName,
    string? AuthorEmail,
    DateTime CreatedAt
);
}
