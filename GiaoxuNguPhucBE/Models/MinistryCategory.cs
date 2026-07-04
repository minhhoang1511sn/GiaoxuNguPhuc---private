namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Nhóm phân loại đoàn thể/giới trong giáo xứ, dùng để lọc theo tab ở trang
    /// công khai (Các Đoàn Thể).
    ///
    /// QUAN TRỌNG: không đổi số thứ tự (giá trị) của các mục đã có,
    /// vì dữ liệu cũ trong DB lưu MinistryCategory dưới dạng số nguyên này.
    /// Chỉ thêm mục mới ở cuối.
    /// </summary>
    public enum MinistryCategory
    {
        Liturgy = 0,    // Phụng vụ
        Youth = 1,      // Giới trẻ
        Charity = 2,    // Xã hội & Bác ái
        Education = 3,  // Giáo dục
    }
}
