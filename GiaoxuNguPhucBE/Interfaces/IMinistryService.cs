using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IMinistryService
    {
        /// <summary>Danh sách đoàn thể đang hoạt động, sắp theo DisplayOrder — dùng cho trang công khai</summary>
        Task<List<MinistryDto>> GetActiveAsync();

        /// <summary>Toàn bộ danh sách (kể cả ngưng hoạt động) — dùng cho trang quản trị</summary>
        Task<List<MinistryDto>> GetAllAsync();

        Task<MinistryDto?> GetByIdAsync(int id);

        Task<MinistryDto> CreateAsync(CreateMinistryDto dto);

        Task<MinistryDto?> UpdateAsync(int id, UpdateMinistryDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
