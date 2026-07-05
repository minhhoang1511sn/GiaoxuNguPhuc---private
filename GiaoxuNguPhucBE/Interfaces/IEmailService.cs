namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IEmailService
    {
        /// <summary>Gửi 1 email HTML. Nếu SMTP chưa được cấu hình (appsettings/.env), lặng lẽ bỏ qua
        /// (chỉ ghi log) thay vì ném lỗi — tránh làm hỏng luồng nghiệp vụ chính (ví dụ đăng ký tài khoản)
        /// chỉ vì tính năng gửi mail (phụ) chưa setup xong.</summary>
        Task SendAsync(string toEmail, string subject, string htmlBody);
    }
}
