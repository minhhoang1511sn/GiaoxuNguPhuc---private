using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class NewsletterService(AppDbContext db) : INewsletterService
    {
        public async Task<bool> SubscribeAsync(SubscribeNewsletterDto dto)
        {
            var email = dto.Email.Trim().ToLowerInvariant();

            var exists = await db.NewsletterSubscribers.AnyAsync(n => n.Email == email);
            if (exists)
            {
                // Đã đăng ký từ trước — không phải lỗi, chỉ đơn giản là không thêm bản ghi mới.
                return false;
            }

            var entity = new NewsletterSubscriber
            {
                Email = email,
                SubscribedAt = DateTime.UtcNow,
            };

            try
            {
                db.NewsletterSubscribers.Add(entity);
                await db.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException)
            {
                // Trường hợp hiếm: 2 request đăng ký cùng email gần như đồng thời, cả 2 đều
                // qua được check AnyAsync() ở trên rồi cùng insert -> unique index ở DB chặn
                // 1 trong 2. Coi như "đã đăng ký rồi" thay vì để lỗi 500 văng ra cho người dùng.
                return false;
            }
        }
    }
}
