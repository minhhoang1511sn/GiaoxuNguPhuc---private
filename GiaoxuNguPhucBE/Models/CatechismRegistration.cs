using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.Models
{
    /// <summary>Đơn đăng ký học giáo lý (Khai Tâm, Rước Lễ, Thêm Sức, Bao Đồng, Dự Tòng, Hôn Nhân...)</summary>
    public class CatechismRegistration
    {
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        public DateTime? DateOfBirth { get; set; }

        /// <summary>"Nam" | "Nữ"</summary>
        [MaxLength(10)]
        public string? Gender { get; set; }

        [MaxLength(150)]
        public string? FatherName { get; set; }

        [MaxLength(150)]
        public string? MotherName { get; set; }

        [Required, MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Email { get; set; }

        [Required, MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        /// <summary>Giáo khu / khu vực sinh hoạt trong giáo xứ</summary>
        [MaxLength(100)]
        public string? ParishZone { get; set; }

        public RegistrationClassType ClassType { get; set; } = RegistrationClassType.KhaiTam;

        /// <summary>Niên khóa, ví dụ "2026-2027"</summary>
        [Required, MaxLength(20)]
        public string SchoolYear { get; set; } = string.Empty;

        public bool IsBaptized { get; set; } = false;

        [MaxLength(200)]
        public string? BaptismPlace { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }

        public RegistrationStatus Status { get; set; } = RegistrationStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
