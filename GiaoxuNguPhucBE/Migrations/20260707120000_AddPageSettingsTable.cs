using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddPageSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PageSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    PageKey = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BannerImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageSettings", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PageSettings_PageKey",
                table: "PageSettings",
                column: "PageKey",
                unique: true);

            // Seed 3 trang hiện đang hỗ trợ đổi ảnh bìa ở trang quản trị (khớp PAGES trong
            // app/admin/banners/page.jsx). BannerImageUrl = null -> trang công khai dùng
            // ảnh mặc định set cứng trong CSS cho tới khi admin upload ảnh mới.
            migrationBuilder.InsertData(
                table: "PageSettings",
                columns: new[] { "Id", "PageKey", "BannerImageUrl", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "about", null, new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "ministries", null, new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "contact", null, new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PageSettings");
        }
    }
}
