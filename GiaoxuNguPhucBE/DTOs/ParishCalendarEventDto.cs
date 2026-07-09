using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Admin thêm mới / sửa một sự kiện trong lịch giáo xứ (Lịch Phụng vụ)</summary>
    public class ParishCalendarEventDto
    {
        [Required, MinLength(2), MaxLength(200)]
        public string Title { get; set; } = null!;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public DateTime EventDate { get; set; }

        public ParishEventType EventType { get; set; }

        [MaxLength(50)]
        public string? TimeLabel { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        public int DisplayOrder { get; set; }
    }
}
