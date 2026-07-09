using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    public class CreateMinistryRegistrationDto
    {
        [Required(ErrorMessage = "Vui lòng chọn đoàn thể.")]
        public int MinistryId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập họ và tên.")]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập số điện thoại.")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
        public string Phone { get; set; } = string.Empty;

        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string? Email { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }
    }
}
