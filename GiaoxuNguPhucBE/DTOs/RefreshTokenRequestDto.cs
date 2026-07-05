using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dùng cho POST /api/auth/refresh và POST /api/auth/logout</summary>
    public record RefreshTokenRequestDto(
        [Required] string RefreshToken
    );
}
