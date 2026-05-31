using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    public class Comment
    {
        public int Id { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string AuthorName { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? AuthorEmail { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int PostId { get; set; }
        public Post Post { get; set; } = null!;

        public int? UserId { get; set; }
        public User? User { get; set; }
    }
}
