namespace GiaoxuNguPhucBE.Models
{
    /// <summary>
    /// Phân loại người phục vụ trong Ban điều hành giáo xứ / các giới.
    ///
    /// QUAN TRỌNG: không đổi số thứ tự (giá trị) của các mục đã có,
    /// vì dữ liệu cũ trong DB lưu ClergyType dưới dạng số nguyên này.
    /// Chỉ thêm mục mới ở cuối.
    /// </summary>
    public enum ClergyType
    {
        LinhMuc = 0,    // Linh mục (Chánh xứ, Phó xứ...)
        ThayXu = 1,     // Thầy xứ / Phó tế
        TuSi = 2,       // Quý Sr / Tu sĩ
        GiaoDan = 3,    // Giáo dân phụ trách (trưởng ban, trưởng giới...)
    }
}
