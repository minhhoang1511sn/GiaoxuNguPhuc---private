namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Các lớp giáo lý mà giáo xứ tổ chức theo niên khóa.
    ///
    /// QUAN TRỌNG: không đổi số thứ tự (giá trị) của các mục đã có,
    /// vì dữ liệu cũ trong DB lưu ClassType dưới dạng số nguyên này.
    /// Chỉ thêm mục mới ở cuối.
    /// </summary>
    public enum RegistrationClassType
    {
        KhaiTam = 0,        // Khai Tâm (Mẫu giáo / Lớp 1-2)
        RuocLe = 1,         // Xưng Tội - Rước Lễ lần đầu
        ThemSuc = 2,        // Thêm Sức
        BaoDong = 3,        // Bao Đồng
        DuTong = 4,         // Dự Tòng (RCIA) - người lớn tìm hiểu đạo
        GiaoLyHonNhan = 5,  // Giáo lý Hôn nhân
        Khac = 6,
    }
}
