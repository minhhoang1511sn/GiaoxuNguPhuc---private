namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu 1 sự kiện lịch giáo xứ trả về cho cả trang công khai lẫn trang quản trị</summary>
    public class ParishCalendarEventResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public int EventType { get; set; }
        /// <summary>Tên loại sự kiện dạng chuỗi (vd. "Mass") — FE dùng để tô màu badge</summary>
        public string EventTypeName { get; set; } = null!;
        public string? TimeLabel { get; set; }
        public string? Location { get; set; }
        public int DisplayOrder { get; set; }
    }
}
