namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Kết quả trả về sau khi đăng nhập / đăng ký / làm mới token thành công.</summary>
    public record AuthResultDto(
        string AccessToken,
        DateTime AccessTokenExpiresAt,
        string RefreshToken,
        DateTime RefreshTokenExpiresAt,
        UserDto User
    );
}
