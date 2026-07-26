namespace GiaoxuNguPhucBE.Respone
{
    /// <summary>
    /// Response gọn cho các endpoint chỉ cần trả về 1 thông báo thành công,
    /// không có dữ liệu DTO cụ thể nào khác (vd. đăng ký nhận tin).
    /// Đặt cạnh ApiError để 2 nhánh phản hồi (lỗi / thành công dạng thông báo)
    /// dùng chung 1 shape { message: string } cho frontend dễ xử lý.
    /// </summary>
    public class ApiMessage
    {
        public string Message { get; set; }

        public ApiMessage(string message)
        {
            Message = message;
        }
    }
}
