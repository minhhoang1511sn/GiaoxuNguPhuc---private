using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeSlidesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HomeSlides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeSlides", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_HomeSlides_DisplayOrder",
                table: "HomeSlides",
                column: "DisplayOrder");

            // Seed 3 ảnh slideshow hiện đang set cứng ở trang chủ (views/Home/Home.jsx)
            // để trang chủ vẫn hiển thị đủ ảnh ngay sau khi cập nhật, cho tới khi admin
            // vào trang quản trị Banner chỉnh sửa lại.
            migrationBuilder.InsertData(
                table: "HomeSlides",
                columns: new[] { "Id", "ImageUrl", "DisplayOrder", "CreatedAt" },
                values: new object[,]
                {
                    { 1, "/images/slider1.JPG", 0, new DateTime(2026, 7, 8, 2, 0, 0, DateTimeKind.Utc) },
                    { 2, "/images/slider2.JPG", 1, new DateTime(2026, 7, 8, 2, 0, 0, DateTimeKind.Utc) },
                    { 3, "/images/slider3.JPG", 2, new DateTime(2026, 7, 8, 2, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomeSlides");
        }
    }
}
