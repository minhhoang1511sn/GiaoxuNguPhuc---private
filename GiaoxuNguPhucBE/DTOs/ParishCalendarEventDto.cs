using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.DTOs
{
    public class ParishCalendarEventDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public ParishEventType EventType { get; set; }
        public string? TimeLabel { get; set; }
        public string? Location { get; set; }
        public int DisplayOrder { get; set; }
    }
}
