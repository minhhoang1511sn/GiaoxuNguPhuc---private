using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Người đăng ký nhận tin qua email ở khối "Đăng ký nhận tin" trên trang Tin tức
    /// (views/News/News.jsx). Trước đây form này chỉ xoá ô nhập rồi không làm gì cả
    /// (chưa có bảng/API tương ứng) — bảng này hoàn thiện tính năng đó.
    /// </summary>
    public class NewsletterSubscriber
    {
        public int Id { get; set; }

        /// <summary>Email người đăng ký nhận tin — chặn trùng ở tầng DB bằng unique index.</summary>
        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    }
}
