using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    /// <summary>
    /// Admin sắp xếp lại thứ tự hiển thị của các ảnh slideshow trang chủ.
    /// OrderedIds là danh sách Id theo đúng thứ tự mong muốn (phần tử đầu tiên
    /// hiển thị trước) — DisplayOrder của từng slide sẽ được gán lại theo vị trí
    /// trong danh sách này.
    /// </summary>
    public record ReorderHomeSlidesDto(
        [Required] List<int> OrderedIds
    );
}
