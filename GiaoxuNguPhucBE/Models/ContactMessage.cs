using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Tin nhắn / góp ý gửi từ form "Gửi tin nhắn cho chúng tôi" ở trang Liên hệ
    /// (views/Contact/Contact.jsx). Trước đây nút "Gửi tin nhắn" chỉ hiện alert rồi
    /// không lưu lại gì (chưa có bảng/API tương ứng) — bảng này hoàn thiện tính năng đó,
    /// cùng cách làm với NewsletterSubscriber / MinistryRegistration trước đó.
    /// </summary>
    public class ContactMessage
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required, MaxLength(3000)]
        public string Content { get; set; } = string.Empty;

        /// <summary>Admin đã xem tin nhắn này chưa — dùng cho trang quản trị (chưa đọc / đã đọc).</summary>
        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
