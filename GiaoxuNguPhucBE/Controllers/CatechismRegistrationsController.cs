using ClosedXML.Excel;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using GiaoxuNguPhucBE.Pagination;
using GiaoxuNguPhucBE.Respone;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiaoxuNguPhucBE.Controllers
{
    [ApiController]
    [Route("api/catechism-registrations")]
    [Produces("application/json")]
    public class CatechismRegistrationsController(
        ICatechismRegistrationService service,
        ILogger<CatechismRegistrationsController> logger) : ControllerBase
    {
        // ── Public Endpoint (User) ───────────────────────────────────────────────

        /// <summary>POST /api/catechism-registrations - Gửi đơn đăng ký học giáo lý</summary>
        [HttpPost]
        public async Task<ActionResult<CatechismRegistrationDto>> catechismRegistrations([FromBody] CreateCatechismRegistrationDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetForAdmin), new { id = result.Id }, result);
        }

        // ── Admin Endpoints ───────────────────────────────────────────────────────

        /// <summary>GET /api/catechism-registrations/admin - Danh sách đăng ký, có lọc + phân trang (admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<PagedResult<CatechismRegistrationDto>>> GetAll([FromQuery] RegistrationQueryParams queryParams)
        {
            var result = await service.GetAllAsync(queryParams);
            return Ok(result);
        }

        /// <summary>GET /api/catechism-registrations/admin/{id} - Chi tiết một đơn đăng ký (admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{id:int}")]
        public async Task<ActionResult<CatechismRegistrationDto>> GetForAdmin(int id)
        {
            var result = await service.GetByIdAsync(id);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return Ok(result);
        }

        /// <summary>PUT /api/catechism-registrations/admin/{id}/status - Duyệt/huỷ đơn (admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id:int}/status")]
        public async Task<ActionResult<CatechismRegistrationDto>> UpdateStatus(int id, [FromBody] UpdateRegistrationStatusDto dto)
        {
            var result = await service.UpdateStatusAsync(id, dto);
            if (result is null)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return Ok(result);
        }

        /// <summary>DELETE /api/catechism-registrations/admin/{id} - Xoá một đơn đăng ký (admin)</summary>
        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id:int}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new ApiError($"Không tìm thấy đơn đăng ký với id {id}."));

            return NoContent();
        }

        /// <summary>
        /// GET /api/catechism-registrations/admin/export - Xuất file Excel (.xlsx) danh sách đăng ký
        /// khớp với các filter hiện tại (không phân trang, xuất toàn bộ kết quả lọc).
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/export")]
        public async Task<IActionResult> Export([FromQuery] RegistrationQueryParams queryParams)
        {
            var rows = await service.GetForExportAsync(queryParams);

            using var workbook = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Đăng ký giáo lý");

            string[] headers =
            [
                "STT", "Họ và tên", "Ngày sinh", "Giới tính", "Họ tên Cha", "Họ tên Mẹ",
                "Số điện thoại", "Email", "Địa chỉ", "Giáo khu", "Lớp giáo lý", "Niên khóa",
                "Đã Rửa tội", "Nơi Rửa tội", "Trạng thái", "Ghi chú", "Ngày nộp đơn"
            ];

            for (var col = 0; col < headers.Length; col++)
            {
                var cell = sheet.Cell(1, col + 1);
                cell.Value = headers[col];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(30, 64, 175);
                cell.Style.Font.FontColor = XLColor.White;
            }

            var classTypeLabels = new Dictionary<RegistrationClassType, string>
            {
                [RegistrationClassType.KhaiTam] = "Khai Tâm",
                [RegistrationClassType.RuocLe] = "Xưng Tội - Rước Lễ",
                [RegistrationClassType.ThemSuc] = "Thêm Sức",
                [RegistrationClassType.BaoDong] = "Bao Đồng",
                [RegistrationClassType.DuTong] = "Dự Tòng (RCIA)",
                [RegistrationClassType.GiaoLyHonNhan] = "Giáo lý Hôn nhân",
                [RegistrationClassType.Khac] = "Khác",
            };

            var statusLabels = new Dictionary<RegistrationStatus, string>
            {
                [RegistrationStatus.Pending] = "Chờ duyệt",
                [RegistrationStatus.Confirmed] = "Đã xác nhận",
                [RegistrationStatus.Cancelled] = "Đã huỷ",
            };

            for (var i = 0; i < rows.Count; i++)
            {
                var r = rows[i];
                var row = i + 2;

                sheet.Cell(row, 1).Value = i + 1;
                sheet.Cell(row, 2).Value = r.FullName;
                sheet.Cell(row, 3).Value = r.DateOfBirth?.ToString("dd/MM/yyyy") ?? "";
                sheet.Cell(row, 4).Value = r.Gender ?? "";
                sheet.Cell(row, 5).Value = r.FatherName ?? "";
                sheet.Cell(row, 6).Value = r.MotherName ?? "";
                sheet.Cell(row, 7).Value = r.Phone;
                sheet.Cell(row, 8).Value = r.Email ?? "";
                sheet.Cell(row, 9).Value = r.Address;
                sheet.Cell(row, 10).Value = r.ParishZone ?? "";
                sheet.Cell(row, 11).Value = classTypeLabels.GetValueOrDefault(r.ClassType, r.ClassType.ToString());
                sheet.Cell(row, 12).Value = r.SchoolYear;
                sheet.Cell(row, 13).Value = r.IsBaptized ? "Có" : "Chưa";
                sheet.Cell(row, 14).Value = r.BaptismPlace ?? "";
                sheet.Cell(row, 15).Value = statusLabels.GetValueOrDefault(r.Status, r.Status.ToString());
                sheet.Cell(row, 16).Value = r.Note ?? "";
                sheet.Cell(row, 17).Value = r.CreatedAt.ToString("dd/MM/yyyy HH:mm");
            }

            sheet.Columns().AdjustToContents();
            sheet.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            var fileName = $"danh-sach-dang-ky-giao-ly_{DateTime.Now:yyyyMMdd_HHmm}.xlsx";
            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName);
        }
    }
}
