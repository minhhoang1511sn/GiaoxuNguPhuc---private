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
        /// <summary>Chỉ Admin mới có thể chỉ định tác giả khác chính mình; với tài khoản
        /// role User, BE luôn ghi đè bằng chính tài khoản đang đăng nhập, bỏ qua giá trị này.</summary>
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
        string? Slug = null,
        /// <summary>Đoàn thể sở hữu bài viết. Chỉ Admin có thể tự chọn (hoặc để trống = bài chung);
        /// với tài khoản role User, BE luôn ghi đè bằng đoàn thể của chính tài khoản đó.</summary>
        int? MinistryId = null
    );
}
