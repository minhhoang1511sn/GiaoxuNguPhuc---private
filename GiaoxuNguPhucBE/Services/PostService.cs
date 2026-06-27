using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class PostService(AppDbContext db) : IPostService
    {
        // ── CreatePost ─────────────────────────────────────────────────────────

        public async Task<PostDetailDto> CreatePostAsync(CreatePostDto dto)
        {
            var authorExists = await db.Users.AnyAsync(u => u.Id == dto.AuthorId);
            if (!authorExists)
                throw new ArgumentException($"Author with id {dto.AuthorId} not found.");

            var slugSeed = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Title : dto.Slug;
            var slug = await GenerateUniqueSlugAsync(slugSeed);

            var now = DateTime.UtcNow;

            var post = new Post
            {
                Title           = dto.Title,
                Slug            = slug,
                Excerpt         = dto.Excerpt,
                Content         = dto.Content,
                ThumbnailUrl    = dto.ThumbnailUrl,
                CoverImageUrl   = dto.CoverImageUrl,
                AuthorId        = dto.AuthorId,
                Category        = dto.Category,
                Tags            = NormalizeTags(dto.Tags),
                Status          = dto.Status,
                IsFeatured      = dto.IsFeatured,
                IsPinned        = dto.IsPinned,
                AllowComments   = dto.AllowComments,
                EventDate       = dto.EventDate,
                MetaTitle       = dto.MetaTitle,
                MetaDescription = dto.MetaDescription,
                PublishedAt     = dto.Status == PostStatus.Published ? now : null,
                CreatedAt       = now,
                UpdatedAt       = now,
            };

            db.Posts.Add(post);
            await db.SaveChangesAsync();
            await db.Entry(post).Reference(p => p.Author).LoadAsync();

            return MapToDetail(post, []);
        }

        // ── GetPosts ───────────────────────────────────────────────────────────

        public async Task<PagedResult<PostListDto>> GetPostsAsync(PostQueryParams q, bool publishedOnly = false)
        {
            var query = db.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .AsQueryable();

            if (publishedOnly)
                query = query.Where(p => p.Status == PostStatus.Published);

            if (!string.IsNullOrWhiteSpace(q.Search))
                query = query.Where(p =>
                    p.Title.Contains(q.Search) ||
                    p.Excerpt.Contains(q.Search) ||
                    (p.Tags != null && p.Tags.Contains(q.Search)));

            if (q.Status.HasValue)
                query = query.Where(p => p.Status == q.Status);

            if (q.Category.HasValue)
                query = query.Where(p => p.Category == q.Category);

            if (!string.IsNullOrWhiteSpace(q.Tag))
                query = query.Where(p => p.Tags != null && p.Tags.Contains(q.Tag));

            if (q.IsFeatured.HasValue)
                query = query.Where(p => p.IsFeatured == q.IsFeatured);

            if (q.IsPinned.HasValue)
                query = query.Where(p => p.IsPinned == q.IsPinned);

            if (q.AuthorId.HasValue)
                query = query.Where(p => p.AuthorId == q.AuthorId);

            query = (q.SortBy.ToLower(), q.SortOrder.ToLower()) switch
            {
                ("title", "asc")       => query.OrderBy(p => p.Title),
                ("title", _)           => query.OrderByDescending(p => p.Title),
                ("createdat", "asc")   => query.OrderBy(p => p.CreatedAt),
                ("viewcount", "asc")   => query.OrderBy(p => p.ViewCount),
                ("viewcount", _)       => query.OrderByDescending(p => p.ViewCount),
                ("publishedat", "asc") => query.OrderBy(p => p.PublishedAt),
                ("publishedat", _)    => query.OrderByDescending(p => p.PublishedAt),
                _                      => query.OrderByDescending(p => p.CreatedAt),
            };

            // Bài ghim luôn ưu tiên hiển thị lên đầu
            query = query.OrderByDescending(p => p.IsPinned).ThenBy(p => 0);

            var totalCount = await query.CountAsync();
            var items = await query
                .Skip((q.Page - 1) * q.PageSize)
                .Take(q.PageSize)
                .ToListAsync();

            return new PagedResult<PostListDto>(
                items.Select(MapToList).ToList(),
                totalCount,
                q.Page,
                q.PageSize,
                (int)Math.Ceiling((double)totalCount / q.PageSize)
            );
        }

        // ── Featured ───────────────────────────────────────────────────────────

        public async Task<List<PostListDto>> GetFeaturedPostsAsync(int take = 5)
        {
            var posts = await db.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .Where(p => p.Status == PostStatus.Published && p.IsFeatured)
                .OrderByDescending(p => p.PublishedAt)
                .Take(take)
                .ToListAsync();

            return posts.Select(MapToList).ToList();
        }

        // ── GetPostById ────────────────────────────────────────────────────────

        public async Task<PostDetailDto?> GetPostByIdAsync(int id, bool countView = false)
        {
            var post = await db.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post is null) return null;

            if (countView)
            {
                post.ViewCount++;
                await db.SaveChangesAsync();
            }

            return MapToDetail(post, post.Comments.ToList());
        }

        // ── GetPostBySlug ──────────────────────────────────────────────────────

        public async Task<PostDetailDto?> GetPostBySlugAsync(string slug, bool countView = false)
        {
            var post = await db.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Slug == slug);

            if (post is null) return null;

            if (countView)
            {
                post.ViewCount++;
                await db.SaveChangesAsync();
            }

            return MapToDetail(post, post.Comments.ToList());
        }

        // ── UpdatePost ─────────────────────────────────────────────────────────

        public async Task<PostDetailDto?> UpdatePostAsync(int id, UpdatePostDto dto)
        {
            var post = await db.Posts
                .Include(p => p.Author)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post is null) return null;

            // Nếu người dùng đổi tiêu đề hoặc chỉ định slug mới khác slug hiện tại -> sinh lại slug
            var desiredSlugSeed = string.IsNullOrWhiteSpace(dto.Slug) ? dto.Title : dto.Slug;
            var newSlugCandidate = Slugify(desiredSlugSeed);
            if (!string.Equals(newSlugCandidate, post.Slug, StringComparison.Ordinal))
                post.Slug = await GenerateUniqueSlugAsync(desiredSlugSeed, excludeId: post.Id);

            // Bài chuyển từ trạng thái khác -> Published lần đầu thì set PublishedAt
            if (dto.Status == PostStatus.Published && post.PublishedAt is null)
                post.PublishedAt = DateTime.UtcNow;

            post.Title           = dto.Title;
            post.Excerpt         = dto.Excerpt;
            post.Content         = dto.Content;
            post.ThumbnailUrl    = dto.ThumbnailUrl;
            post.CoverImageUrl   = dto.CoverImageUrl;
            post.Category        = dto.Category;
            post.Tags            = NormalizeTags(dto.Tags);
            post.Status          = dto.Status;
            post.IsFeatured      = dto.IsFeatured;
            post.IsPinned        = dto.IsPinned;
            post.AllowComments   = dto.AllowComments;
            post.EventDate       = dto.EventDate;
            post.MetaTitle       = dto.MetaTitle;
            post.MetaDescription = dto.MetaDescription;
            post.UpdatedAt       = DateTime.UtcNow;

            await db.SaveChangesAsync();
            return MapToDetail(post, post.Comments.ToList());
        }

        // ── DeletePost ─────────────────────────────────────────────────────────

        public async Task<bool> DeletePostAsync(int id)
        {
            var post = await db.Posts.FindAsync(id);
            if (post is null) return false;

            db.Posts.Remove(post);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Comments ───────────────────────────────────────────────────────────

        public async Task<List<CommentDto>> GetCommentsAsync(int postId)
        {
            var exists = await db.Posts.AnyAsync(p => p.Id == postId);
            if (!exists) throw new ArgumentException($"Post with id {postId} not found.");

            return await db.Comments
                .Where(c => c.PostId == postId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentDto(c.Id, c.Content, c.AuthorName, c.AuthorEmail, c.CreatedAt))
                .ToListAsync();
        }

        public async Task<CommentDto> AddCommentAsync(int postId, CreateCommentDto dto)
        {
            var post = await db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
            if (post is null) throw new ArgumentException($"Post with id {postId} not found.");

            if (!post.AllowComments)
                throw new InvalidOperationException("This post does not allow comments.");

            var comment = new Comment
            {
                PostId      = postId,
                Content     = dto.Content,
                AuthorName  = dto.AuthorName,
                AuthorEmail = dto.AuthorEmail,
                CreatedAt   = DateTime.UtcNow,
            };

            db.Comments.Add(comment);
            await db.SaveChangesAsync();

            return new CommentDto(comment.Id, comment.Content, comment.AuthorName, comment.AuthorEmail, comment.CreatedAt);
        }

        // ── Slug helpers ───────────────────────────────────────────────────────

        /// <summary>Chuyển chuỗi tiếng Việt có dấu thành slug URL-friendly (bỏ dấu, thay khoảng trắng bằng "-")</summary>
        private static string Slugify(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;

            var normalized = input.Trim().ToLowerInvariant();

            // Bỏ dấu tiếng Việt
            normalized = RemoveDiacritics(normalized);

            // Thay mọi ký tự không phải chữ/số bằng "-"
            normalized = Regex.Replace(normalized, "[^a-z0-9]+", "-");
            normalized = normalized.Trim('-');
            normalized = Regex.Replace(normalized, "-{2,}", "-");

            if (normalized.Length > 300)
                normalized = normalized[..300].TrimEnd('-');

            return string.IsNullOrEmpty(normalized) ? "bai-viet" : normalized;
        }

        private static string RemoveDiacritics(string text)
        {
            text = text.Replace('đ', 'd').Replace('Đ', 'D');
            var normalized = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(c);
                if (category != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            }
            return sb.ToString().Normalize(NormalizationForm.FormC);
        }

        /// <summary>Sinh slug duy nhất trong DB, tự thêm -2, -3... nếu trùng</summary>
        private async Task<string> GenerateUniqueSlugAsync(string seed, int? excludeId = null)
        {
            var baseSlug = Slugify(seed);
            var slug = baseSlug;
            var counter = 2;

            while (await db.Posts.AnyAsync(p => p.Slug == slug && p.Id != (excludeId ?? -1)))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        /// <summary>Chuẩn hoá danh sách tag: trim, lowercase, loại trùng, nối lại bằng dấu phẩy</summary>
        private static string? NormalizeTags(string? rawTags)
        {
            if (string.IsNullOrWhiteSpace(rawTags)) return null;

            var tags = rawTags
                .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.ToLowerInvariant())
                .Distinct()
                .ToList();

            return tags.Count == 0 ? null : string.Join(",", tags);
        }

        // ── Mappers ────────────────────────────────────────────────────────────

        private static PostDetailDto MapToDetail(Post post, List<Comment> comments) => new(
            post.Id,
            post.Title,
            post.Slug,
            post.Excerpt,
            post.Content,
            post.ThumbnailUrl,
            post.CoverImageUrl,
            post.Category.ToString(),
            post.Status.ToString(),
            post.Tags,
            post.IsFeatured,
            post.IsPinned,
            post.AllowComments,
            post.ViewCount,
            post.EventDate,
            post.PublishedAt,
            post.MetaTitle,
            post.MetaDescription,
            post.AuthorId,
            post.Author?.FullName ?? string.Empty,
            post.Author?.AvatarUrl,
            post.CreatedAt,
            post.UpdatedAt,
            comments.Select(c => new CommentDto(c.Id, c.Content, c.AuthorName, c.AuthorEmail, c.CreatedAt)).ToList()
        );

        private static PostListDto MapToList(Post post) => new(
            post.Id,
            post.Title,
            post.Slug,
            post.Excerpt,
            post.ThumbnailUrl,
            post.Category.ToString(),
            post.Status.ToString(),
            post.Tags,
            post.IsFeatured,
            post.IsPinned,
            post.ViewCount,
            post.EventDate,
            post.PublishedAt,
            post.Author?.FullName ?? string.Empty,
            post.Author?.AvatarUrl,
            post.CreatedAt,
            post.UpdatedAt,
            post.Comments.Count
        );
    }
}
