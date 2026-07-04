using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IParishHistoryService
    {
        /// <summary>Toàn bộ dòng thời gian, sắp theo DisplayOrder — dùng cho cả trang công khai và quản trị</summary>
        Task<List<ParishHistoryMilestoneDto>> GetAllAsync();

        Task<ParishHistoryMilestoneDto?> GetByIdAsync(int id);

        Task<ParishHistoryMilestoneDto> CreateAsync(CreateParishHistoryMilestoneDto dto);

        Task<ParishHistoryMilestoneDto?> UpdateAsync(int id, UpdateParishHistoryMilestoneDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
