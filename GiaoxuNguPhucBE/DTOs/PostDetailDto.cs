namespace GiaoxuNguPhucBE.DTOs
{
    public record PostDetailDto(
        int Id,
        string Title,
        string Slug,
        string Excerpt,
        string Content,
        string? ThumbnailUrl,
        string? CoverImageUrl,
        string Category,
        string Status,
        string? Tags,
        bool IsFeatured,
        bool IsPinned,
        bool AllowComments,
        int ViewCount,
        DateTime? EventDate,
        DateTime? PublishedAt,
        string? MetaTitle,
        string? MetaDescription,
        int AuthorId,
        string AuthorName,
        string? AuthorAvatar,
        DateTime CreatedAt,
        DateTime UpdatedAt,
        List<CommentDto> Comments
    );
}
