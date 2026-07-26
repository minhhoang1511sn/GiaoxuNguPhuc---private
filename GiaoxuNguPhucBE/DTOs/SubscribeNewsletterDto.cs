using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Request đăng ký nhận tin (POST /api/newsletter/subscribe)</summary>
    public class SubscribeNewsletterDto
    {
        [Required, EmailAddress, MaxLength(150)]
        public string Email { get; set; } = string.Empty;
    }
}
