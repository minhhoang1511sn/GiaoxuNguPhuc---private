using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.DTOs
{
    public class MinistryRegistrationDto
    {
        public int Id { get; set; }
        public int MinistryId { get; set; }
        public string MinistryName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Note { get; set; }
        public RegistrationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
