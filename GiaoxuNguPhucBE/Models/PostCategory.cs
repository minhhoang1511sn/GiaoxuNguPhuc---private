namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Chuyên mục bài viết - tham khảo cấu trúc chuyên mục phổ biến
    /// trên các trang web giáo xứ (tin tức, thông báo, giáo lý, suy niệm...)
    /// </summary>
    public enum PostCategory
    {
        TinTuc = 0,        // Tin tức Giáo xứ
        ThongBao = 1,       // Thông báo (giờ lễ, lịch sinh hoạt...)
        GiaoLy = 2,        // Giáo lý - Giáo huấn
        SuyNiem = 3,       // Suy niệm Lời Chúa
        HoatDongDoanThe = 4, // Hoạt động đoàn thể / giáo họ
        LichPhungVu = 5,    // Lịch Phụng vụ
        CaoPho = 6,        // Cáo phó - Hiếu báo
        HinhAnhVideo = 7,   // Hình ảnh - Video
        Khac = 8           // Khác
    }
}
