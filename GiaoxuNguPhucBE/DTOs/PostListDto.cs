namespace GiaoxuNguPhucBE.DTOs
{
    public record PostListDto(
        int Id,
        string Title,
        string Slug,
        string Excerpt,
        string? ThumbnailUrl,
        string Category,
        string Status,
        string? Tags,
        bool IsFeatured,
        bool IsPinned,
        int ViewCount,
        DateTime? EventDate,
        DateTime? PublishedAt,
        string AuthorName,
        string? AuthorAvatar,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        int CommentCount
    );
}
