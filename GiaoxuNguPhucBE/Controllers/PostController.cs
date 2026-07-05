using Microsoft.AspNetCore.Mvc;
using GiaoxuNguPhucBE.Interfaces;
using Microsoft.AspNetCore.Authorization;
using GiaoxuNguPhucBE.Pagination;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Respone;
using System.Security.Claims;
namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PostsController(IPostService postService, ILogger<PostsController> logger) : ControllerBase
    {
        // ── Public Endpoints (User) ────────────────────────────────────────────────

        /// <summary>GET /api/posts - Get all published posts (paginated, filter by category/tag/featured/pinned)</summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<PostListDto>>> GetPosts([FromQuery] PostQueryParams queryParams)
        {
            var result = await postService.GetPostsAsync(queryParams, publishedOnly: true);
            return Ok(result);
        }

        /// <summary>GET /api/posts/featured - Get featured posts for homepage banner</summary>
        [HttpGet("featured")]
        public async Task<ActionResult<List<PostListDto>>> GetFeaturedPosts([FromQuery] int take = 5)
        {
            var result = await postService.GetFeaturedPostsAsync(take);
            return Ok(result);
        }

        /// <summary>GET /api/posts/{id} - Get post detail by id (increments view count)</summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PostDetailDto>> GetPost(int id)
        {
            var post = await postService.GetPostByIdAsync(id, countView: true);
            if (post is null)
                return NotFound(new ApiError($"Post with id {id} not found."));

            return Ok(post);
        }

        /// <summary>GET /api/posts/slug/{slug} - Get post detail by friendly URL slug (increments view count)</summary>
        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<PostDetailDto>> GetPostBySlug(string slug)
        {
            var post = await postService.GetPostBySlugAsync(slug, countView: true);
            if (post is null)
                return NotFound(new ApiError($"Post with slug '{slug}' not found."));

            return Ok(post);
        }

        /// <summary>GET /api/posts/{id}/comments - Get comments for a post</summary>
        [HttpGet("{id:int}/comments")]
        public async Task<ActionResult<List<CommentDto>>> GetComments(int id)
        {
            var comments = await postService.GetCommentsAsync(id);
            return Ok(comments);
        }

        /// <summary>POST /api/posts/{id}/comments - Add a comment to a post</summary>
        [HttpPost("{id:int}/comments")]
        public async Task<ActionResult<CommentDto>> AddComment(int id, [FromBody] CreateCommentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var comment = await postService.AddCommentAsync(id, dto);
                return CreatedAtAction(nameof(GetComments), new { id }, comment);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        // ── Quản trị bài viết (Admin: toàn bộ | User: chỉ bài viết đoàn thể của mình) ──

        /// <summary>GET /api/posts/admin - Get ALL posts including drafts.
        /// Admin thấy toàn bộ; tài khoản role User chỉ thấy bài viết thuộc đoàn thể của mình.</summary>
        [Authorize]
        [HttpGet("admin")]
        public async Task<ActionResult<PagedResult<PostListDto>>> GetAllPosts([FromQuery] PostQueryParams queryParams)
        {
            if (!IsAdmin)
            {
                if (CurrentMinistryId is null)
                    return Forbid();

                // Ép cứng MinistryId về đúng đoàn thể của tài khoản, bỏ qua giá trị client gửi lên.
                queryParams = queryParams with { MinistryId = CurrentMinistryId };
            }

            var result = await postService.GetPostsAsync(queryParams, publishedOnly: false);
            return Ok(result);
        }

        /// <summary>GET /api/posts/admin/{id} - Get post detail by id without incrementing view count</summary>
        [Authorize]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<PostDetailDto>> GetPostForAdmin(int id)
        {
            var post = await postService.GetPostByIdAsync(id, countView: false);
            if (post is null)
                return NotFound(new ApiError($"Post with id {id} not found."));

            if (!IsAdmin && post.MinistryId != CurrentMinistryId)
                return Forbid();

            return Ok(post);
        }

        /// <summary>POST /api/posts - Create a new post.
        /// Admin có thể tạo bài cho bất kỳ đoàn thể nào (hoặc bài chung); tài khoản role User
        /// phải đã được gán đoàn thể, bài viết sẽ tự động thuộc đoàn thể đó.</summary>
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PostDetailDto>> CreatePost([FromBody] CreatePostDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var post = await postService.CreatePostAsync(dto, CurrentUserId, CurrentMinistryId, IsAdmin);
                return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>PUT /api/posts/{id} - Update a post.
        /// Admin sửa được mọi bài; tài khoản role User chỉ sửa được bài thuộc đoàn thể của mình.</summary>
        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<ActionResult<PostDetailDto>> UpdatePost(int id, [FromBody] UpdatePostDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var post = await postService.UpdatePostAsync(id, dto, CurrentMinistryId, IsAdmin);
                if (post is null)
                    return NotFound(new ApiError($"Post with id {id} not found."));

                return Ok(post);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiError(ex.Message));
            }
        }

        /// <summary>DELETE /api/posts/{id} - Delete a post.
        /// Admin xoá được mọi bài; tài khoản role User chỉ xoá được bài thuộc đoàn thể của mình.</summary>
        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeletePost(int id)
        {
            try
            {
                var deleted = await postService.DeletePostAsync(id, CurrentMinistryId, IsAdmin);
                if (!deleted)
                    return NotFound(new ApiError($"Post with id {id} not found."));

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        // ── Helper ─────────────────────────────────────────────────────────────

        private int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin => User.IsInRole("Admin");

        /// <summary>Đoàn thể của tài khoản đang đăng nhập (đọc từ claim trong AccessToken), null nếu chưa được gán.</summary>
        private int? CurrentMinistryId =>
            int.TryParse(User.FindFirstValue("MinistryId"), out var ministryId) ? ministryId : null;
    }
}
