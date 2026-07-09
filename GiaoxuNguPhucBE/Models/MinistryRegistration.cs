namespace GiaoxuNguPhucBE.Models
{
    public class MinistryRegistration
    {
        public int Id { get; set; }
        public int MinistryId { get; set; }
        public Ministry? Ministry { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Note { get; set; }

        public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
