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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Post → Author (User)
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

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
        }
    }

}
