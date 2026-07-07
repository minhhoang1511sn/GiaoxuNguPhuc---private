using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Một ảnh trong slideshow (banner trượt tự động) ở đầu trang chủ, do admin
    /// quản lý (thêm mới / xoá / sắp xếp lại thứ tự) trong trang quản trị
    /// "Quản lý Ảnh nền (Banner)" — mục "Slideshow trang chủ". Trang chủ công khai
    /// chỉ đọc, hiển thị theo DisplayOrder.
    /// </summary>
    public class HomeSlide
    {
        public int Id { get; set; }

        /// <summary>Đường dẫn ảnh của slide (ảnh đã upload qua POST /api/uploads?folder=banners)</summary>
        [Required, MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>Thứ tự hiển thị trong slideshow (nhỏ hơn hiển thị trước)</summary>
        public int DisplayOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
