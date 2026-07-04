namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Chuyên mục bài viết - tham khảo cấu trúc chuyên mục phổ biến
    /// trên các trang web giáo xứ/giáo phận Việt Nam (tin tức, thông báo,
    /// giáo lý, suy niệm, giới trẻ, cáo phó...).
    ///
    /// QUAN TRỌNG: không đổi số thứ tự (giá trị) của các mục đã có,
    /// vì dữ liệu cũ trong DB lưu Category dưới dạng số nguyên này.
    /// Chỉ thêm mục mới ở cuối, không chèn giữa hoặc xoá số đã dùng.
    /// </summary>
    public enum PostCategory
    {
        TinTuc = 0,          // Tin tức Giáo xứ
        ThongBao = 1,        // Thông báo (giờ lễ, lịch sinh hoạt...)
        GiaoLy = 2,          // Giáo lý - Giáo huấn
        SuyNiem = 3,         // Suy niệm Lời Chúa
        HoatDongDoanThe = 4, // Hoạt động đoàn thể / giáo họ
        LichPhungVu = 5,     // Lịch Phụng vụ
        CaoPho = 6,          // Cáo phó - Hiếu báo
        HinhAnhVideo = 7,    // Hình ảnh - Video (album, sự kiện ghi hình)
        Khac = 8,            // Khác
        GioiTre = 9          // Giới Trẻ - sinh hoạt, đại hội, lớp huấn luyện
    }
}
