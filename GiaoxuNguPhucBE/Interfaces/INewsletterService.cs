using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface INewsletterService
    {
        /// <summary>
        /// Đăng ký nhận tin bằng email. Trả về false nếu email này đã đăng ký từ trước
        /// (coi là "đã đăng ký rồi" chứ không phải lỗi — controller vẫn trả 200 OK).
        /// </summary>
        Task<bool> SubscribeAsync(SubscribeNewsletterDto dto);
    }
}
