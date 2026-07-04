namespace GiaoxuNguPhucBE.Models
{
    public enum RegistrationStatus
    {
        Pending = 0,    // Chờ duyệt
        Confirmed = 1,  // Đã xác nhận / đã nhận vào lớp
        Cancelled = 2,  // Đã huỷ / từ chối
    }
}
