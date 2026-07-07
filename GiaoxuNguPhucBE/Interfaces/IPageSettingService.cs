using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IPageSettingService
    {
        /// <summary>Lấy ảnh bìa hiện tại của một trang (dùng cho cả trang công khai và quản trị) — luôn lấy từ DB</summary>
        Task<PageSettingDto> GetAsync(string pageKey);

        /// <summary>Lấy ảnh bìa của tất cả các trang đã cấu hình (dùng cho trang quản trị)</summary>
        Task<IReadOnlyList<PageSettingDto>> GetAllAsync();

        /// <summary>Admin cập nhật ảnh bìa của một trang. Trả về null nếu pageKey không hợp lệ.</summary>
        Task<PageSettingDto?> UpdateAsync(string pageKey, UpdatePageSettingDto dto);
    }
}
