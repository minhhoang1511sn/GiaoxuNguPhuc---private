using GiaoxuNguPhucBE.Models;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface ITokenService
    {
        /// <summary>Sinh JWT Access Token chứa claim UserId/Email/Role, hạn dùng ngắn (mặc định 15 phút).</summary>
        string GenerateAccessToken(User user);

        /// <summary>Thời điểm hết hạn tương ứng với Access Token vừa sinh.</summary>
        DateTime GetAccessTokenExpiry();

        /// <summary>Sinh Refresh Token — chuỗi ngẫu nhiên an toàn (không phải JWT), dùng để xin Access Token mới.</summary>
        string GenerateRefreshTokenValue();

        /// <summary>Thời điểm hết hạn tương ứng với Refresh Token vừa sinh (mặc định 7 ngày).</summary>
        DateTime GetRefreshTokenExpiry();
    }
}
