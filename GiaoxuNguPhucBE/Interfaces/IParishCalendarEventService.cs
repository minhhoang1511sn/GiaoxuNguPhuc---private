using GiaoxuNguPhucBE.DTOs;

namespace GiaoxuNguPhucBE.Interfaces
{
    public interface IParishCalendarEventService
    {
        /// <summary>Danh sách sự kiện trong 1 tháng, sắp theo ngày rồi thứ tự hiển thị — dùng cho cả trang công khai lẫn trang quản trị</summary>
        Task<List<ParishCalendarEventResponseDto>> GetByMonthAsync(int year, int month);

        Task<ParishCalendarEventResponseDto> CreateAsync(ParishCalendarEventDto dto);

        Task<ParishCalendarEventResponseDto?> UpdateAsync(int id, ParishCalendarEventDto dto);

        Task<bool> DeleteAsync(int id);
    }
}
