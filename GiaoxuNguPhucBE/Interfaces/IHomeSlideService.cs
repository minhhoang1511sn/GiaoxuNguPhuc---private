using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IHomeSlideService
    {
        /// <summary>Toàn bộ ảnh slideshow trang chủ, sắp theo DisplayOrder — dùng cho cả trang công khai và quản trị</summary>
        Task<List<HomeSlideDto>> GetAllAsync();

        /// <summary>Admin thêm mới một ảnh slideshow. Ảnh mới luôn được thêm vào cuối danh sách hiển thị.</summary>
        Task<HomeSlideDto> CreateAsync(CreateHomeSlideDto dto);

        /// <summary>Admin xoá một ảnh slideshow. Trả về false nếu không tìm thấy.</summary>
        Task<bool> DeleteAsync(int id);

        /// <summary>Admin sắp xếp lại thứ tự hiển thị. Trả về false nếu danh sách Id không khớp dữ liệu hiện có.</summary>
        Task<bool> ReorderAsync(ReorderHomeSlidesDto dto);
    }
}
