using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Pagination
{
    public record RegistrationQueryParams
    {
        public int Page { get; init; } = 1;
        public int PageSize { get; init; } = 10;

        /// <summary>Tìm theo họ tên, số điện thoại hoặc email</summary>
        public string? Search { get; init; }

        public RegistrationClassType? ClassType { get; init; }
        public RegistrationStatus? Status { get; init; }
        public string? SchoolYear { get; init; }
        public string? ParishZone { get; init; }

        /// <summary>Lọc theo khoảng thời gian nộp đơn (CreatedAt)</summary>
        public DateTime? FromDate { get; init; }
        public DateTime? ToDate { get; init; }

        public string SortBy { get; init; } = "createdAt";
        public string SortOrder { get; init; } = "desc";
    }
}
