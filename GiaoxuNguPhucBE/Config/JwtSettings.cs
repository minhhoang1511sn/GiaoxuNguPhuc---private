namespace GiaoxuNguPhucBE.Config
{
    /// <summary>
    /// Cấu hình JWT (access token) — được nạp trong Program.cs, ưu tiên biến môi trường
    /// (giống cách ConnectionString đang lấy DB_HOST/DB_PORT/... từ .env), có giá trị mặc định
    /// hợp lý nếu biến môi trường không được set (ví dụ môi trường dev).
    /// </summary>
    public class JwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = "GiaoxuNguPhucBE";
        public string Audience { get; set; } = "GiaoxuNguPhucFE";

        /// <summary>Thời hạn Access Token (JWT) — ngắn, vì đây là token dùng để gọi API.</summary>
        public int AccessTokenMinutes { get; set; } = 15;

        /// <summary>Thời hạn Refresh Token — dài hơn nhiều, dùng để xin Access Token mới.</summary>
        public int RefreshTokenDays { get; set; } = 7;
    }
}
