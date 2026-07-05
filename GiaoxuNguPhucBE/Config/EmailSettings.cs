namespace GiaoxuNguPhucBE.Config
{
    /// <summary>Cấu hình SMTP dùng để gửi mail (thông báo đăng ký tài khoản chờ duyệt, v.v.)</summary>
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = "";
        public int SmtpPort { get; set; } = 587;
        public string SmtpUser { get; set; } = "";
        public string SmtpPass { get; set; } = "";

        /// <summary>Địa chỉ hiển thị "From" khi gửi mail. Nếu để trống sẽ dùng SmtpUser.</summary>
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "Giáo xứ Ngũ Phúc";

        /// <summary>Có dùng SSL/TLS hay không (Gmail/Office365 dùng STARTTLS ở port 587 → true).</summary>
        public bool EnableSsl { get; set; } = true;

        /// <summary>Email nhận thông báo có tài khoản mới đăng ký cần duyệt.</summary>
        public string AdminEmail { get; set; } = "";

        /// <summary>URL gốc của trang frontend, dùng để chèn link "vào trang quản trị duyệt" trong email.</summary>
        public string FrontendUrl { get; set; } = "http://localhost:3000";

        /// <summary>Nếu thiếu cấu hình SMTP (chưa setup), tắt gửi mail thay vì ném lỗi làm hỏng luồng đăng ký.</summary>
        public bool IsConfigured => !string.IsNullOrWhiteSpace(SmtpHost) && !string.IsNullOrWhiteSpace(SmtpUser);
    }
}
