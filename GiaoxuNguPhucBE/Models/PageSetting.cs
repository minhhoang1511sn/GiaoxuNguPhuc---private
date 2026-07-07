using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Cấu hình riêng cho từng trang công khai — hiện tại dùng để lưu ảnh bìa (banner)
    /// của trang. Mỗi trang (about, ministries, contact...) có đúng một bản ghi, xác
    /// định bởi PageKey duy nhất. Trang công khai chỉ đọc, admin cập nhật trong trang
    /// quản trị "Quản lý Ảnh nền (Banner) các trang".
    /// </summary>
    public class PageSetting
    {
        public int Id { get; set; }

        /// <summary>Khoá định danh trang, ví dụ "about", "ministries", "contact"</summary>
        [Required, MaxLength(50)]
        public string PageKey { get; set; } = string.Empty;

        /// <summary>Đường dẫn ảnh bìa (banner) của trang. Null/rỗng = dùng ảnh mặc định phía FE.</summary>
        [MaxLength(500)]
        public string? BannerImageUrl { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
