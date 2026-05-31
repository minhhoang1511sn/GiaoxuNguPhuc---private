using System.ComponentModel.DataAnnotations;
namespace GiaoxuNguPhucBE.Models
{
    public class Post
    {
        public int Id { get; set; }

        [Required, MaxLength(300)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Excerpt { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        public string? ThumbnailUrl { get; set; }
        public string? CoverImageUrl { get; set; }

        public PostStatus Status { get; set; } = PostStatus.Draft;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int AuthorId { get; set; }
        public User Author { get; set; } = null!;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
