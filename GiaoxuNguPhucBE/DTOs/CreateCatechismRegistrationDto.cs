using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    public record CreateCatechismRegistrationDto(
        [Required, MinLength(2), MaxLength(150)] string FullName,
        DateTime? DateOfBirth,
        string? Gender,
        string? FatherName,
        string? MotherName,
        [Required, MinLength(9), MaxLength(20)] string Phone,
        [EmailAddress, MaxLength(150)] string? Email,
        [Required, MinLength(5), MaxLength(300)] string Address,
        string? ParishZone,
        RegistrationClassType ClassType,
        [Required, MaxLength(20)] string SchoolYear,
        bool IsBaptized = false,
        string? BaptismPlace = null,
        [MaxLength(1000)] string? Note = null
    );
}
