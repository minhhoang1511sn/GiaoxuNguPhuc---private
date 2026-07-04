using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Danh sách khóa học giáo lý do admin quản lý (thêm mới / sửa / ẩn).
    /// Trang đăng ký công khai (Register) lấy dữ liệu từ bảng này để hiển thị
    /// các lựa chọn khóa học thay vì danh sách được viết cứng ở frontend.
    ///
    /// Trường <see cref="ClassType"/> ánh xạ tới enum <see cref="RegistrationClassType"/>
    /// để khi người dùng gửi đơn đăng ký (CatechismRegistration), giá trị ClassType
    /// gửi lên vẫn tương thích với dữ liệu cũ đã lưu trong DB. Các khóa học mới hoàn
    /// toàn (không thuộc 1 trong các lớp cố định) có thể được thêm với ClassType = Khac.
    /// </summary>
    public class CatechismClass
    {
        public int Id { get; set; }

        /// <summary>Tên khóa học hiển thị cho người dùng, ví dụ "Khai Tâm"</summary>
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        /// <summary>Mô tả ngắn về khóa học, hiển thị trên trang đăng ký</summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>Ánh xạ tới enum RegistrationClassType để tương thích với đơn đăng ký</summary>
        public RegistrationClassType ClassType { get; set; } = RegistrationClassType.Khac;

        /// <summary>Niên khóa áp dụng, ví dụ "2026-2027" (để trống nếu áp dụng mọi niên khóa)</summary>
        [MaxLength(20)]
        public string? SchoolYear { get; set; }

        /// <summary>Thứ tự hiển thị trên trang đăng ký (nhỏ hơn hiển thị trước)</summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>Chỉ những khóa học đang bật mới hiển thị ở phía người dùng</summary>
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
