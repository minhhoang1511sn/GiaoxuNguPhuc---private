namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Dữ liệu trả về cho 1 tin nhắn liên hệ (dùng ở trang quản trị).</summary>
    public class ContactMessageDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
