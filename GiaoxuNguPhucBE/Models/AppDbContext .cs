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
        }
    }

}
