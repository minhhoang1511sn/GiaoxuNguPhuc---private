using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Pagination;
namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IPostService
    {
        Task<PagedResult<PostListDto>> GetPostsAsync(PostQueryParams queryParams, bool publishedOnly = false);
        Task<PostDetailDto?> GetPostByIdAsync(int id, bool countView = false);
        Task<PostDetailDto?> GetPostBySlugAsync(string slug, bool countView = false);
        Task<PostDetailDto> CreatePostAsync(CreatePostDto dto);
        Task<PostDetailDto?> UpdatePostAsync(int id, UpdatePostDto dto);
        Task<bool> DeletePostAsync(int id);
        Task<List<PostListDto>> GetFeaturedPostsAsync(int take = 5);
        Task<List<CommentDto>> GetCommentsAsync(int postId);
        Task<CommentDto> AddCommentAsync(int postId, CreateCommentDto dto);
    }
}
