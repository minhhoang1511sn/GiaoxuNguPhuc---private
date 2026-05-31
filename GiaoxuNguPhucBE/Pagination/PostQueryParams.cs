using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Pagination
{
    public record PostQueryParams
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Search { get; init; }
        public PostStatus? Status { get; init; }
        public int? AuthorId { get; init; }
        public string SortBy { get; init; } = "createdAt";
        public string SortOrder { get; init; } = "desc";
    }
}
