namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Trạng thái duyệt của tài khoản tự đăng ký (qua /api/auth/register).
    /// Tài khoản do Admin tạo trực tiếp (AdminCreateUserDto) được đánh dấu Approved ngay,
    /// vì Admin đã chủ động tạo nên không cần tự duyệt lại chính mình.
    /// </summary>
    public enum UserApprovalStatus
    {
        Pending = 0,    // Vừa đăng ký, đang chờ Admin duyệt — CHƯA đăng nhập được
        Approved = 1,   // Đã được Admin duyệt — đăng nhập bình thường
        Rejected = 2,   // Đã bị Admin từ chối — không thể đăng nhập
    }
}
