using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class SeedCalendarPageSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mở rộng danh sách trang được phép đổi ảnh bìa ở trang quản trị (khớp
            // AllowedPageKeys trong PageSettingService và PAGES trong
            // app/admin/banners/page.jsx): thêm "calendar" (Lịch Phụng Vụ). Không
            // bắt buộc — PageSettingService tự tạo bản ghi rỗng khi được GET/PUT
            // lần đầu — nhưng seed sẵn để trang quản trị liệt kê đủ ngay từ đầu
            // (GET /api/page-settings).
            migrationBuilder.InsertData(
                table: "PageSettings",
                columns: new[] { "Id", "PageKey", "BannerImageUrl", "UpdatedAt" },
                values: new object[,]
                {
                    { 6, "calendar", null, new DateTime(2026, 7, 8, 1, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PageSettings",
                keyColumn: "Id",
                keyValues: new object[] { 6 });
        }
    }
}
