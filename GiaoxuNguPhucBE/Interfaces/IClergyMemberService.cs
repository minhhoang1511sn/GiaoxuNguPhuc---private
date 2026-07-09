using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IClergyMemberService
    {
        /// <summary>Danh sách người đang phục vụ hiện tại, sắp theo DisplayOrder — dùng cho trang công khai</summary>
        Task<List<ClergyMemberDto>> GetCurrentAsync();

        /// <summary>Danh sách người đã từng phục vụ (các niên khóa trước), sắp theo niên khóa gần nhất trước — dùng cho trang công khai</summary>
        Task<List<ClergyMemberDto>> GetPastAsync();

        /// <summary>Toàn bộ danh sách (kể cả các niên khóa trước) — dùng cho trang quản trị</summary>
        Task<List<ClergyMemberDto>> GetAllAsync();

        Task<ClergyMemberDto?> GetByIdAsync(int id);

        Task<ClergyMemberDto> CreateAsync(CreateClergyMemberDto dto);

        Task<ClergyMemberDto?> UpdateAsync(int id, UpdateClergyMemberDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
