using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Thông tin linh mục, thầy xứ, quý sr (tu sĩ) và giáo dân trong ban điều hành
    /// giáo xứ / các giới, do admin quản lý (thêm mới / sửa / xoá).
    ///
    /// Mỗi bản ghi gắn với một <see cref="SchoolYear"/> (niên khóa phục vụ), vì một
    /// vị trí (ví dụ "Chánh xứ", "Trưởng Ca đoàn Têrêsa") có thể do nhiều người đảm
    /// nhiệm qua các niên khóa khác nhau. Cờ <see cref="IsCurrent"/> đánh dấu người
    /// đang phục vụ ở hiện tại — trang công khai (Về Giáo Xứ / Các Giới) chỉ hiển thị
    /// những bản ghi có IsCurrent = true, còn trang quản trị hiển thị toàn bộ lịch sử.
    /// </summary>
    public class ClergyMember
    {
        public int Id { get; set; }

        /// <summary>Họ tên đầy đủ, ví dụ "Lm. Giuse Nguyễn Văn An"</summary>
        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        /// <summary>Phân loại: Linh mục / Thầy xứ / Tu sĩ / Giáo dân</summary>
        public ClergyType Type { get; set; } = ClergyType.LinhMuc;

        /// <summary>Chức danh hiển thị, ví dụ "Chánh xứ", "Trưởng Ban Caritas"</summary>
        [Required, MaxLength(150)]
        public string Position { get; set; } = string.Empty;

        /// <summary>Tên giới/ban phụ trách, ví dụ "Ca Đoàn Têrêsa" (để trống nếu phục vụ chung giáo xứ)</summary>
        [MaxLength(150)]
        public string? MinistryName { get; set; }

        /// <summary>Niên khóa phục vụ, ví dụ "2024-2026"</summary>
        [MaxLength(20)]
        public string? SchoolYear { get; set; }

        /// <summary>Đang phục vụ ở hiện tại hay đã kết thúc niên khóa</summary>
        public bool IsCurrent { get; set; } = true;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(100), EmailAddress]
        public string? Email { get; set; }

        [MaxLength(30)]
        public string? Phone { get; set; }

        /// <summary>Mô tả/giới thiệu ngắn</summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>Thứ tự hiển thị trên trang công khai (nhỏ hơn hiển thị trước)</summary>
        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
