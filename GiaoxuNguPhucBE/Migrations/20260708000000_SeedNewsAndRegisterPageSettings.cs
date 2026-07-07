using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class SeedNewsAndRegisterPageSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Mở rộng danh sách trang được phép đổi ảnh bìa ở trang quản trị (khớp
            // AllowedPageKeys trong PageSettingService và PAGES trong
            // app/admin/banners/page.jsx): thêm "news" (Tin Tức) và "register"
            // (Đăng Ký Giáo Lý). Không bắt buộc — PageSettingService tự tạo bản ghi
            // rỗng khi được GET/PUT lần đầu — nhưng seed sẵn để trang quản trị liệt
            // kê đủ ngay từ đầu (GET /api/page-settings).
            migrationBuilder.InsertData(
                table: "PageSettings",
                columns: new[] { "Id", "PageKey", "BannerImageUrl", "UpdatedAt" },
                values: new object[,]
                {
                    { 4, "news", null, new DateTime(2026, 7, 8, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "register", null, new DateTime(2026, 7, 8, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PageSettings",
                keyColumn: "Id",
                keyValues: new object[] { 4, 5 });
        }
    }
}
