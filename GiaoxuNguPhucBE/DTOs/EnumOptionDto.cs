namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>Một lựa chọn enum (key/value/label) để hiển thị dropdown, filter... ở frontend</summary>
    public record EnumOptionDto(
        string Key,
        int Value,
        string Label
    );

    /// <summary>Toàn bộ danh sách enum dùng ở các trang quản trị — nguồn dữ liệu duy nhất
    /// cho mọi dropdown/filter trước đây bị viết cứng ở frontend.</summary>
    public record EnumsMetaDto(
        List<EnumOptionDto> ClassTypes,
        List<EnumOptionDto> PostCategories,
        List<EnumOptionDto> PostStatuses,
        List<EnumOptionDto> MinistryCategories,
        List<EnumOptionDto> ClergyTypes,
        List<EnumOptionDto> RegistrationStatuses,
        List<EnumOptionDto> UserApprovalStatuses
    );
}
