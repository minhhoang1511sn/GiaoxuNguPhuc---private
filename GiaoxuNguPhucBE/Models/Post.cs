using System.ComponentModel.DataAnnotations;
namespace GiaoxuNguPhucBE.Models
{
    public class Post
    {
        public int Id { get; set; }

        [Required, MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        /// <summary>Đường dẫn thân thiện URL, tự sinh từ Title, dùng cho /tin-tuc/{slug}</summary>
        [Required, MaxLength(350)]
        public string Slug { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Excerpt { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ThumbnailUrl { get; set; }
        public string? CoverImageUrl { get; set; }

        /// <summary>Chuyên mục: Tin tức, Thông báo, Giáo lý, Suy niệm, Cáo phó...</summary>
        public PostCategory Category { get; set; } = PostCategory.TinTuc;

        /// <summary>Danh sách thẻ, lưu dạng "le-giang-sinh,thong-bao,2026" để filter/search</summary>
        [MaxLength(500)]
        public string? Tags { get; set; }

        public PostStatus Status { get; set; } = PostStatus.Draft;

        /// <summary>Bài nổi bật - hiển thị ở banner/trang chủ</summary>
        public bool IsFeatured { get; set; } = false;

        /// <summary>Ghim bài lên đầu danh sách (thông báo quan trọng, cáo phó...)</summary>
        public bool IsPinned { get; set; } = false;

        /// <summary>Cho phép bình luận hay không</summary>
        public bool AllowComments { get; set; } = true;

        /// <summary>Số lượt xem</summary>
        public int ViewCount { get; set; } = 0;

        /// <summary>Ngày diễn ra sự kiện/lễ (dùng cho Thông báo, Lịch Phụng vụ); null nếu không áp dụng</summary>
        public DateTime? EventDate { get; set; }

        /// <summary>Thời điểm bài viết được xuất bản (khác CreatedAt nếu để lên lịch đăng)</summary>
        public DateTime? PublishedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // SEO
        [MaxLength(300)]
        public string? MetaTitle { get; set; }

        [MaxLength(500)]
        public string? MetaDescription { get; set; }

        public int AuthorId { get; set; }
        public User Author { get; set; } = null!;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
