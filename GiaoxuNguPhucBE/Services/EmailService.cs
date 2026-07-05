using System.Net;
using System.Net.Mail;
using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Interfaces;

namespace GiaoxuNguPhucBE.Services
{
    public class EmailService(EmailSettings settings, ILogger<EmailService> logger) : IEmailService
    {
        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            if (!settings.IsConfigured)
            {
                logger.LogWarning(
                    "Chưa cấu hình SMTP (SMTP_HOST/SMTP_USER) — bỏ qua gửi mail tới {To}: {Subject}",
                    toEmail, subject);
                return;
            }

            if (string.IsNullOrWhiteSpace(toEmail))
            {
                logger.LogWarning("Không có địa chỉ email người nhận — bỏ qua gửi mail: {Subject}", subject);
                return;
            }

            try
            {
                using var client = new SmtpClient(settings.SmtpHost, settings.SmtpPort)
                {
                    Credentials = new NetworkCredential(settings.SmtpUser, settings.SmtpPass),
                    EnableSsl = settings.EnableSsl,
                };

                var fromAddress = string.IsNullOrWhiteSpace(settings.FromEmail) ? settings.SmtpUser : settings.FromEmail;

                using var message = new MailMessage
                {
                    From = new MailAddress(fromAddress, settings.FromName),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true,
                };
                message.To.Add(toEmail);

                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Gửi mail thất bại (SMTP sai cấu hình, mất mạng...) không được làm hỏng luồng nghiệp
                // vụ chính (ví dụ đăng ký tài khoản vẫn phải thành công) — chỉ log lại để admin biết.
                logger.LogError(ex, "Gửi email tới {To} thất bại: {Subject}", toEmail, subject);
            }
        }
    }
}
