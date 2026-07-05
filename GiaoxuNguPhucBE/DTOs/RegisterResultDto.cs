namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Kết quả trả về sau khi đăng ký (/api/auth/register). Khác với trước đây, KHÔNG còn
    /// tự động đăng nhập (không có AccessToken/RefreshToken) vì tài khoản phải chờ Admin duyệt.</summary>
    public record RegisterResultDto(
        string Message,
        UserDto User
    );
}
