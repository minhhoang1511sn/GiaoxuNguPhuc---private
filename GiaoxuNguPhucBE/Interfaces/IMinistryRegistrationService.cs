using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IMinistryRegistrationService
    {
        Task<MinistryRegistrationDto?> CreateAsync(CreateMinistryRegistrationDto dto);
        Task<List<MinistryRegistrationDto>> GetAllAsync();
        Task<MinistryRegistrationDto?> GetByIdAsync(int id);
        Task<List<MinistryRegistrationDto>> GetByMinistryIdAsync(int ministryId); // ← mới
        Task<List<MinistryRegistrationCountDto>> GetCountsAsync(); // ← mới
        Task<MinistryRegistrationDto?> UpdateStatusAsync(int id, UpdateRegistrationStatusDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
