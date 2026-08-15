using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Request gửi tin nhắn liên hệ (POST /api/contact-messages) — form công khai, ai cũng gửi được.</summary>
    public class CreateContactMessageDto
    {
        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required, MaxLength(3000)]
        public string Content { get; set; } = string.Empty;
    }
}
