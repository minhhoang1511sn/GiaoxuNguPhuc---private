using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface ICatechismClassService
    {
        /// <summary>Danh sách khóa học đang bật, sắp theo DisplayOrder — dùng cho trang đăng ký công khai</summary>
        Task<List<CatechismClassDto>> GetActiveAsync();

        /// <summary>Toàn bộ danh sách khóa học (kể cả đang ẩn) — dùng cho trang quản trị</summary>
        Task<List<CatechismClassDto>> GetAllAsync();

        Task<CatechismClassDto?> GetByIdAsync(int id);

        Task<CatechismClassDto> CreateAsync(CreateCatechismClassDto dto);

        Task<CatechismClassDto?> UpdateAsync(int id, UpdateCatechismClassDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
