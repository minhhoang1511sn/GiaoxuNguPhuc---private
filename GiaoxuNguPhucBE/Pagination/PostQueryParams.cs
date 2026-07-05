using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Pagination
{
    public record PostQueryParams
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Search { get; init; }
        public PostStatus? Status { get; init; }
        public PostCategory? Category { get; init; }
        public string? Tag { get; init; }
        public bool? IsFeatured { get; init; }
        public bool? IsPinned { get; init; }
        public int? AuthorId { get; init; }
        /// <summary>Lọc theo đoàn thể. Với tài khoản role User, BE tự ép giá trị này về
        /// đúng đoàn thể của tài khoản đang đăng nhập, bất kể client gửi gì lên.</summary>
        public int? MinistryId { get; init; }
        public string SortBy { get; init; } = "createdAt";
        public string SortOrder { get; init; } = "desc";
    }
}
