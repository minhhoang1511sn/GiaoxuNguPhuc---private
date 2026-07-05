using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Pagination;
namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IPostService
    {
        Task<PagedResult<PostListDto>> GetPostsAsync(PostQueryParams queryParams, bool publishedOnly = false);
        Task<PostDetailDto?> GetPostByIdAsync(int id, bool countView = false);
        Task<PostDetailDto?> GetPostBySlugAsync(string slug, bool countView = false);

        /// <summary>
        /// Tạo bài viết mới.
        /// - Nếu <paramref name="isAdmin"/> = false: AuthorId và MinistryId luôn bị ghi đè bằng
        ///   chính tài khoản/đoàn thể của người đang đăng nhập, bất kể dto gửi gì lên.
        /// </summary>
        /// <exception cref="InvalidOperationException">Tài khoản role User chưa được gán đoàn thể nào</exception>
        Task<PostDetailDto> CreatePostAsync(CreatePostDto dto, int currentUserId, int? currentMinistryId, bool isAdmin);

        /// <exception cref="UnauthorizedAccessException">Tài khoản role User cố sửa bài không thuộc đoàn thể của mình</exception>
        Task<PostDetailDto?> UpdatePostAsync(int id, UpdatePostDto dto, int? currentMinistryId, bool isAdmin);

        /// <exception cref="UnauthorizedAccessException">Tài khoản role User cố xoá bài không thuộc đoàn thể của mình</exception>
        Task<bool> DeletePostAsync(int id, int? currentMinistryId, bool isAdmin);

        Task<List<PostListDto>> GetFeaturedPostsAsync(int take = 5);
        Task<List<CommentDto>> GetCommentsAsync(int postId);
        Task<CommentDto> AddCommentAsync(int postId, CreateCommentDto dto);
    }
}
