using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IContactInfoService
    {
        /// <summary>Lấy thông tin liên hệ hiện tại (dùng cho cả trang công khai và quản trị) — luôn lấy từ DB</summary>
        Task<ContactInfoDto> GetAsync();

        /// <summary>Admin cập nhật thông tin liên hệ</summary>
        Task<ContactInfoDto> UpdateAsync(UpdateContactInfoDto dto);
    }
}
