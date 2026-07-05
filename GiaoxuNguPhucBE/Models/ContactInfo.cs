using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Thông tin liên hệ của giáo xứ (địa chỉ, điện thoại, email, mạng xã hội, giờ lễ...),
    /// hiển thị ở trang "Liên hệ" / Footer / widget liên hệ phía công khai và được admin
    /// cập nhật trong trang quản trị.
    /// Đây là bảng "singleton" — chỉ có duy nhất một bản ghi (Id = 1), không có thao tác
    /// thêm/xoá, chỉ có xem và cập nhật.
    /// </summary>
    public class ContactInfo
    {
        public int Id { get; set; }

        /// <summary>Tên giáo xứ, ví dụ "Giáo xứ Ngũ Phúc"</summary>
        [Required, MaxLength(200)]
        public string ParishName { get; set; } = string.Empty;

        /// <summary>Địa chỉ giáo xứ</summary>
        [Required, MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        /// <summary>Số điện thoại văn phòng giáo xứ</summary>
        [Required, MaxLength(30)]
        public string Phone { get; set; } = string.Empty;

        /// <summary>Số điện thoại khẩn cấp (nếu có)</summary>
        [MaxLength(30)]
        public string? EmergencyPhone { get; set; }

        /// <summary>Email liên hệ</summary>
        [Required, MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        /// <summary>Đường dẫn trang Facebook (nếu có)</summary>
        [MaxLength(300)]
        public string? Facebook { get; set; }

        /// <summary>Đường dẫn kênh Youtube (nếu có)</summary>
        [MaxLength(300)]
        public string? Youtube { get; set; }

        /// <summary>Số Zalo liên hệ (nếu có)</summary>
        [MaxLength(30)]
        public string? Zalo { get; set; }

        /// <summary>Đường dẫn nhúng Google Maps (iframe src) hiển thị bản đồ giáo xứ</summary>
        [MaxLength(1000)]
        public string? MapEmbedUrl { get; set; }

        /// <summary>Đường dẫn xem trên Google Maps (nút "Xem trên Google Maps")</summary>
        [MaxLength(500)]
        public string? MapUrl { get; set; }

        /// <summary>Giờ làm việc văn phòng giáo xứ (text tự do, hiển thị nguyên dòng)</summary>
        [MaxLength(500)]
        public string? OfficeHours { get; set; }

        /// <summary>Lịch giờ lễ (text tự do, hiển thị nguyên dòng)</summary>
        [MaxLength(1000)]
        public string? MassSchedule { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
