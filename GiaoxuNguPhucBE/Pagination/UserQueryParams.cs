using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Pagination
{
    public record UserQueryParams
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;
        public string? Search { get; init; }
        public UserRole? Role { get; init; }
        public bool? IsActive { get; init; }
        public UserApprovalStatus? ApprovalStatus { get; init; }
        public string SortBy { get; init; } = "createdAt";
        public string SortOrder { get; init; } = "desc";
    }
}
