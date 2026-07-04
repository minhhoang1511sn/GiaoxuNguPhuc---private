using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Thông tin một đoàn thể/giới trong giáo xứ (Ca đoàn, Giới trẻ, Ban Caritas,
    /// Legio Mariae...), do admin quản lý (thêm mới / sửa / xoá), hiển thị ở
    /// trang công khai "Các Đoàn Thể" (views/Ministry).
    ///
    /// Trưởng ban của đoàn thể không lưu ở đây — được liên kết gián tiếp qua
    /// trường <see cref="ClergyMember.MinistryName"/> (so khớp theo tên) để
    /// tránh trùng lặp dữ liệu với module Giáo sĩ đã có.
    /// </summary>
    public class Ministry
    {
        public int Id { get; set; }

        /// <summary>Tên đoàn thể, ví dụ "Ca Đoàn Têrêsa"</summary>
        [Required, MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        /// <summary>Nhóm phân loại dùng để lọc theo tab ở trang công khai</summary>
        public MinistryCategory Category { get; set; } = MinistryCategory.Liturgy;

        /// <summary>Nhãn hiển thị tuỳ chỉnh (để trống thì trang công khai sẽ dùng nhãn mặc định theo Category)</summary>
        [MaxLength(50)]
        public string? CategoryLabel { get; set; }

        /// <summary>Mô tả hoạt động của đoàn thể</summary>
        [Required, MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        /// <summary>Icon/emoji hiển thị trên thẻ đoàn thể, ví dụ "🎵"</summary>
        [MaxLength(10)]
        public string? Icon { get; set; }

        /// <summary>Thứ tự hiển thị trên trang công khai (nhỏ hơn hiển thị trước)</summary>
        public int DisplayOrder { get; set; } = 0;

        /// <summary>Đang hoạt động và hiển thị công khai hay không</summary>
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
