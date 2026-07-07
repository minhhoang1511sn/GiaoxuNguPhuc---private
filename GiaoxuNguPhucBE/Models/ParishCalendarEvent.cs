namespace GiaoxuNguPhucBE.Models
{
    public enum ParishEventType
    {
        Mass = 0,
        Sacrament = 1,
        Activity = 2,
        Special = 3
    }

    public class ParishCalendarEvent
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime EventDate { get; set; }
        public ParishEventType EventType { get; set; }
        public string? TimeLabel { get; set; }
        public string? Location { get; set; }
        public int DisplayOrder { get; set; }
    }

  
}
