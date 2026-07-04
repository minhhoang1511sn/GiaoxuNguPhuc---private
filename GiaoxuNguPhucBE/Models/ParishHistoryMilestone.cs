using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Một mốc/giai đoạn trong lược sử hình thành và phát triển của giáo xứ,
    /// do admin quản lý (thêm mới / sửa / xoá), hiển thị dạng dòng thời gian
    /// (timeline) ở tab "Lịch sử" trên trang Về Giáo Xứ (phía công khai).
    /// </summary>
    public class ParishHistoryMilestone
    {
        public int Id { get; set; }

        /// <summary>Năm hoặc giai đoạn, ví dụ "1954" hoặc "1975 - 1990"</summary>
        [Required, MaxLength(30)]
        public string Year { get; set; } = string.Empty;

        /// <summary>Tiêu đề ngắn gọn của mốc sự kiện, ví dụ "Thành lập giáo xứ"</summary>
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>Nội dung mô tả chi tiết</summary>
        [Required, MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        /// <summary>Thứ tự hiển thị trên dòng thời gian (nhỏ hơn hiển thị trước)</summary>
        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
