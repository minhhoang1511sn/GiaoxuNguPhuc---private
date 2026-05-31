using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        public string? AvatarUrl { get; set; }

        public UserRole Role { get; set; } = UserRole.User;

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
public enum UserRole
{
    User = 0,
    Admin = 1
}
