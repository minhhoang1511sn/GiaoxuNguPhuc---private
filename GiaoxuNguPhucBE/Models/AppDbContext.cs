using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace GiaoxuNguPhucBE.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CatechismRegistration> CatechismRegistrations { get; set; }
        public DbSet<CatechismClass> CatechismClasses { get; set; }
        public DbSet<ClergyMember> ClergyMembers { get; set; }
        public DbSet<ParishHistoryMilestone> ParishHistoryMilestones { get; set; }
        public DbSet<Ministry> Ministries { get; set; }
        public DbSet<MinistryRegistration> MinistryRegistrations { get; set; }
        public DbSet<ContactInfo> ContactInfos { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<ParishCalendarEvent> ParishCalendarEvents { get; set; }
        public DbSet<PageSetting> PageSettings { get; set; }
        public DbSet<HomeSlide> HomeSlides { get; set; }
        public DbSet<NewsletterSubscriber> NewsletterSubscribers { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Post → Author (User)
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Post → Ministry (đoàn thể sở hữu bài viết, có thể null = bài chung của giáo xứ)
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Ministry)
                .WithMany(m => m.Posts)
                .HasForeignKey(p => p.MinistryId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Post>()
                .HasIndex(p => p.MinistryId);

            // User → Ministry (tài khoản role User trực thuộc 1 đoàn thể, có thể null)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Ministry)
                .WithMany(m => m.Members)
                .HasForeignKey(u => u.MinistryId)
                .OnDelete(DeleteBehavior.SetNull);

            // User.Email: trước đây KHÔNG có index -> Login/Register (AnyAsync/FirstOrDefaultAsync
            // theo Email) phải full table scan bảng Users mỗi lần gọi. Thêm unique index vừa tăng
            // tốc tra cứu, vừa chặn trùng email ở tầng DB (thay vì chỉ dựa vào check AnyAsync() ở
            // code, vốn có thể bị race condition nếu 2 request đăng ký cùng email gần như đồng thời).
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // NewsletterSubscriber.Email: unique — chặn 1 email đăng ký nhận tin nhiều lần
            // ở tầng DB (thay vì chỉ check AnyAsync() ở code, tránh race condition khi 2
            // request đăng ký cùng email gần như đồng thời).
            modelBuilder.Entity<NewsletterSubscriber>()
                .HasIndex(n => n.Email)
                .IsUnique();

            // Post.Slug: unique, dùng để truy cập theo URL thân thiện
            modelBuilder.Entity<Post>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            // Index hỗ trợ truy vấn danh sách bài viết theo chuyên mục / trạng thái
            modelBuilder.Entity<Post>()
                .HasIndex(p => new { p.Status, p.Category });

            modelBuilder.Entity<Post>()
                .HasIndex(p => p.IsPinned);

            // Comment → Post
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment → User (optional)
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            // Hỗ trợ truy vấn/lọc danh sách đăng ký giáo lý theo lớp, trạng thái, niên khóa
            modelBuilder.Entity<CatechismRegistration>()
                .HasIndex(r => new { r.ClassType, r.Status, r.SchoolYear });

            modelBuilder.Entity<CatechismRegistration>()
                .HasIndex(r => r.CreatedAt);

            // Hỗ trợ truy vấn danh sách khóa học đang mở, sắp theo thứ tự hiển thị
            modelBuilder.Entity<CatechismClass>()
                .HasIndex(c => new { c.IsActive, c.DisplayOrder });

            // Hỗ trợ truy vấn danh sách người đang phục vụ hiện tại, lọc theo niên khóa / loại
            modelBuilder.Entity<ClergyMember>()
                .HasIndex(c => new { c.IsCurrent, c.DisplayOrder });

            modelBuilder.Entity<ClergyMember>()
                .HasIndex(c => new { c.SchoolYear, c.Type });

            // Hỗ trợ truy vấn dòng thời gian lược sử giáo xứ theo thứ tự hiển thị
            modelBuilder.Entity<ParishHistoryMilestone>()
                .HasIndex(h => h.DisplayOrder);

            // Hỗ trợ truy vấn danh sách đoàn thể đang hoạt động theo thứ tự hiển thị,
            // và lọc theo nhóm phân loại (tab) ở trang công khai
            modelBuilder.Entity<Ministry>()
                .HasIndex(m => new { m.IsActive, m.DisplayOrder });

            modelBuilder.Entity<Ministry>()
                .HasIndex(m => m.Category);

            modelBuilder.Entity<ParishCalendarEvent>()
          .Property(e => e.EventType)
          .HasConversion<int>();

            // ContactInfo: bảng "singleton" chỉ có 1 bản ghi (Id = 1) lưu thông tin
            // liên hệ giáo xứ, không cần thêm index vì luôn truy vấn theo khoá chính.

            // RefreshToken → User: 1 user có nhiều refresh token (nhiều thiết bị/phiên đăng nhập).
            // Xoá user thì xoá luôn các refresh token của user đó (Cascade).
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Token là chuỗi ngẫu nhiên duy nhất, dùng để tra cứu nhanh khi refresh/logout
            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.Token)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(rt => rt.UserId);

            // PageSetting.PageKey: mỗi trang (about, ministries, contact...) chỉ có đúng
            // 1 bản ghi cấu hình ảnh bìa — khớp với IX_PageSettings_PageKey (unique) đã
            // tạo trong migration AddPageSettingsTable.
            modelBuilder.Entity<PageSetting>()
                .HasIndex(p => p.PageKey)
                .IsUnique();

            // Hỗ trợ truy vấn danh sách ảnh slideshow trang chủ theo thứ tự hiển thị
            modelBuilder.Entity<HomeSlide>()
                .HasIndex(s => s.DisplayOrder);
        }
    }

}
