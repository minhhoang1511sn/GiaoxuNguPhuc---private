using System.Security.Cryptography;
using System.Text;

namespace GiaoxuNguPhucBE.Helpers
{
    /// <summary>
    /// Hash/verify mật khẩu người dùng.
    ///
    /// TRƯỚC ĐÂY: mật khẩu được hash bằng SHA256 thuần (không salt, không cost factor) —
    /// nhanh, không tốn tài nguyên để tính, nên nếu DB bị lộ thì rất dễ bị brute-force /
    /// tấn công bằng rainbow table (đặc biệt với các mật khẩu ngắn/phổ biến).
    ///
    /// BÂY GIỜ: mật khẩu MỚI được hash bằng PBKDF2-HMACSHA256 với salt ngẫu nhiên 16 byte
    /// và 100.000 vòng lặp (thông số khuyến nghị hiện tại của OWASP cho PBKDF2-SHA256),
    /// lưu dạng "PBKDF2$<iterations>$<saltBase64>$<hashBase64>" để tự chứa đủ thông tin
    /// verify sau này (không cần đổi thêm cột DB).
    ///
    /// Dùng PBKDF2 có sẵn trong .NET (System.Security.Cryptography) thay vì BCrypt/Argon2
    /// để không phải thêm NuGet package mới.
    ///
    /// TƯƠNG THÍCH NGƯỢC: các tài khoản đã đăng ký từ trước vẫn có PasswordHash ở định dạng
    /// SHA256 cũ (chuỗi base64 44 ký tự, không có prefix "PBKDF2$"). Verify() nhận diện được
    /// cả 2 định dạng; khi 1 user đăng nhập thành công bằng hash cũ, verify trả về
    /// needsRehash = true để nơi gọi tự lưu lại PasswordHash mới bằng Hash() — nâng cấp dần
    /// từng tài khoản mỗi khi họ đăng nhập, không cần ép toàn bộ user đổi mật khẩu ngay lập tức.
    /// </summary>
    public static class PasswordHasher
    {
        private const string Prefix = "PBKDF2";
        private const int SaltSizeBytes = 16;
        private const int HashSizeBytes = 32;
        private const int Iterations = 100_000;

        /// <summary>Hash mật khẩu bằng thuật toán hiện tại (PBKDF2), dùng cho mật khẩu MỚI
        /// (đăng ký, admin tạo tài khoản, đổi/reset mật khẩu, nâng cấp hash cũ).</summary>
        public static string Hash(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSizeBytes);
            var hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                HashSizeBytes);

            return $"{Prefix}${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
        }

        /// <summary>
        /// Kiểm tra mật khẩu đúng với hash đã lưu hay không (hỗ trợ cả hash mới PBKDF2
        /// lẫn hash cũ SHA256 thuần để không phá vỡ tài khoản đã có).
        /// </summary>
        /// <param name="needsRehash">true nếu verify đúng nhưng hash đang lưu là định dạng
        /// cũ (SHA256) hoặc dùng số vòng lặp thấp hơn hiện tại — nơi gọi nên lưu lại
        /// PasswordHash = Hash(password) ngay sau khi xác thực thành công.</param>
        public static bool Verify(string password, string? storedHash, out bool needsRehash)
        {
            needsRehash = false;
            if (string.IsNullOrEmpty(storedHash))
                return false;

            if (storedHash.StartsWith(Prefix + "$", StringComparison.Ordinal))
                return VerifyPbkdf2(password, storedHash, out needsRehash);

            return VerifyLegacySha256(password, storedHash, out needsRehash);
        }

        private static bool VerifyPbkdf2(string password, string storedHash, out bool needsRehash)
        {
            needsRehash = false;

            var parts = storedHash.Split('$');
            if (parts.Length != 4 || !int.TryParse(parts[1], out var iterations))
                return false;

            byte[] salt, expectedHash;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                expectedHash = Convert.FromBase64String(parts[3]);
            }
            catch (FormatException)
            {
                return false;
            }

            var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                iterations,
                HashAlgorithmName.SHA256,
                expectedHash.Length);

            var isMatch = CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
            if (isMatch && iterations < Iterations)
                needsRehash = true; // hash cũ dùng số vòng lặp thấp hơn cấu hình hiện tại

            return isMatch;
        }

        private static bool VerifyLegacySha256(string password, string storedHash, out bool needsRehash)
        {
            needsRehash = false;

            using var sha256 = SHA256.Create();
            var computed = Convert.ToBase64String(sha256.ComputeHash(Encoding.UTF8.GetBytes(password)));

            // So sánh constant-time để tránh lộ thông tin qua timing attack, kể cả với
            // đường verify "cũ" này.
            var isMatch = FixedTimeStringEquals(computed, storedHash);
            if (isMatch)
                needsRehash = true; // luôn nâng cấp hash cũ lên PBKDF2 khi verify đúng

            return isMatch;
        }

        private static bool FixedTimeStringEquals(string a, string b)
        {
            var bytesA = Encoding.UTF8.GetBytes(a);
            var bytesB = Encoding.UTF8.GetBytes(b);

            if (bytesA.Length != bytesB.Length)
            {
                // Vẫn chạy 1 phép so sánh constant-time (với chính nó) để độ trễ không
                // tiết lộ rõ ràng việc độ dài không khớp ngay từ đầu.
                CryptographicOperations.FixedTimeEquals(bytesA, bytesA);
                return false;
            }

            return CryptographicOperations.FixedTimeEquals(bytesA, bytesB);
        }
    }
}
