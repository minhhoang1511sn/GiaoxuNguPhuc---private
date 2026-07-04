using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface ICatechismRegistrationService
    {
        /// <summary>User gửi đơn đăng ký từ trang public</summary>
        Task<CatechismRegistrationDto> CreateAsync(CreateCatechismRegistrationDto dto);

        /// <summary>Danh sách có lọc + phân trang (admin)</summary>
        Task<PagedResult<CatechismRegistrationDto>> GetAllAsync(RegistrationQueryParams q);

        Task<CatechismRegistrationDto?> GetByIdAsync(int id);

        Task<CatechismRegistrationDto?> UpdateStatusAsync(int id, UpdateRegistrationStatusDto dto);

        Task<bool> DeleteAsync(int id);

        /// <summary>Lấy TOÀN BỘ danh sách khớp filter (không phân trang) để xuất Excel</summary>
        Task<List<CatechismRegistration>> GetForExportAsync(RegistrationQueryParams q);
    }
}
