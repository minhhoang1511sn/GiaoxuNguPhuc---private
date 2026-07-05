using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    public record UpdatePostDto(
        [Required, MinLength(5), MaxLength(300)] string Title,
        [Required, MinLength(10), MaxLength(500)] string Excerpt,
        [Required, MinLength(10)] string Content,
        string? ThumbnailUrl,
        string? CoverImageUrl,
        PostCategory Category = PostCategory.TinTuc,
        string? Tags = null,
        PostStatus Status = PostStatus.Draft,
        bool IsFeatured = false,
        bool IsPinned = false,
        bool AllowComments = true,
        DateTime? EventDate = null,
        string? MetaTitle = null,
        string? MetaDescription = null,
        string? Slug = null,
        /// <summary>Chỉ Admin mới đổi được đoàn thể sở hữu bài; với tài khoản role User, BE bỏ qua
        /// giá trị này (giữ nguyên MinistryId hiện có của bài viết).</summary>
        int? MinistryId = null
    );
}
