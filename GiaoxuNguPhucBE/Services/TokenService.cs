using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.IdentityModel.Tokens;

namespace GiaoxuNguPhucBE.Services
{
    public class TokenService(JwtSettings jwtSettings) : ITokenService
    {
        public string GenerateAccessToken(User user)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.FullName),
                new(ClaimTypes.Role, user.Role.ToString()),
            };

            // Đoàn thể của tài khoản (role User) — dùng để phân quyền quản lý bài viết
            // theo đoàn thể mà không cần truy vấn lại DB ở mỗi request.
            if (user.MinistryId.HasValue)
                claims.Add(new Claim("MinistryId", user.MinistryId.Value.ToString()));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: GetAccessTokenExpiry(),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public DateTime GetAccessTokenExpiry() => DateTime.UtcNow.AddMinutes(jwtSettings.AccessTokenMinutes);

        public string GenerateRefreshTokenValue()
        {
            var randomBytes = RandomNumberGenerator.GetBytes(64);
            return Convert.ToBase64String(randomBytes);
        }

        public DateTime GetRefreshTokenExpiry() => DateTime.UtcNow.AddDays(jwtSettings.RefreshTokenDays);
    }
}
