using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Pagination;
namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IPostService
    {
        Task<PagedResult<PostListDto>> GetPostsAsync(PostQueryParams queryParams, bool publishedOnly = false);
        Task<PostDetailDto?> GetPostByIdAsync(int id);
        Task<PostDetailDto> CreatePostAsync(CreatePostDto dto);
        Task<PostDetailDto?> UpdatePostAsync(int id, UpdatePostDto dto);
        Task<bool> DeletePostAsync(int id);
        Task<List<CommentDto>> GetCommentsAsync(int postId);
        Task<CommentDto> AddCommentAsync(int postId, CreateCommentDto dto);
    }
}
