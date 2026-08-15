using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IContactMessageService
    {
        /// <summary>Lưu 1 tin nhắn liên hệ mới và gửi mail thông báo cho admin (nếu đã cấu hình SMTP).</summary>
        Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto);

        /// <summary>Danh sách tin nhắn liên hệ, mới nhất trước — dùng cho trang quản trị.</summary>
        Task<List<ContactMessageDto>> GetAllAsync();

        Task<ContactMessageDto?> GetByIdAsync(int id);

        /// <summary>Đánh dấu đã đọc — trả về null nếu không tìm thấy id.</summary>
        Task<ContactMessageDto?> MarkAsReadAsync(int id);

        /// <summary>Số tin nhắn chưa đọc — dùng cho badge thông báo ở trang quản trị.</summary>
        Task<int> GetUnreadCountAsync();

        Task<bool> DeleteAsync(int id);
    }
}
