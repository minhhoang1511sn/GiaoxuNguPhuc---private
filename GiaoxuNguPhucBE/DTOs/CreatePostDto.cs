using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;


namespace GiaoxuNguPhucBE.DTOs
{
    public record CreatePostDto(
        [Required, MinLength(5), MaxLength(300)] string Title,
        [Required, MinLength(10), MaxLength(500)] string Excerpt,
        [Required, MinLength(10)] string Content,
        string? ThumbnailUrl,
        string? CoverImageUrl,
        int AuthorId,
        PostCategory Category = PostCategory.TinTuc,
        string? Tags = null,
        PostStatus Status = PostStatus.Draft,
        bool IsFeatured = false,
        bool IsPinned = false,
        bool AllowComments = true,
        DateTime? EventDate = null,
        string? MetaTitle = null,
        string? MetaDescription = null,
        /// <summary>Tuỳ chọn: tự đặt slug riêng, nếu để trống sẽ tự sinh từ Title</summary>
        string? Slug = null
    );
}
