using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddCatechismClassesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CatechismClasses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ClassType = table.Column<int>(type: "int", nullable: false),
                    SchoolYear = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatechismClasses", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_CatechismClasses_IsActive_DisplayOrder",
                table: "CatechismClasses",
                columns: new[] { "IsActive", "DisplayOrder" });

            // Seed dữ liệu khóa học mặc định, khớp với danh sách trước đây được viết cứng
            // ở frontend (views/Register/Register.jsx), để hành vi không đổi ngay sau khi
            // chuyển sang lấy dữ liệu từ DB.
            migrationBuilder.InsertData(
                table: "CatechismClasses",
                columns: new[] { "Id", "Name", "Description", "ClassType", "SchoolYear", "DisplayOrder", "IsActive", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Khai Tâm", "Dành cho các em chuẩn bị vào lớp giáo lý căn bản.", 0, null, 1, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Xưng Tội - Rước Lễ lần đầu", "Dành cho các em đủ tuổi lãnh nhận bí tích Thánh Thể lần đầu.", 1, null, 2, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Thêm Sức", "Dành cho các em đã Rước Lễ, chuẩn bị lãnh nhận bí tích Thêm Sức.", 2, null, 3, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "Bao Đồng", "Dành cho thanh thiếu niên sau lớp Thêm Sức.", 3, null, 4, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "Dự Tòng (RCIA)", "Dành cho người lớn muốn tìm hiểu và gia nhập đạo Công giáo.", 4, null, 5, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, "Giáo lý Hôn nhân", "Dành cho các đôi chuẩn bị lãnh nhận bí tích Hôn Phối.", 5, null, 6, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, "Khác", "Các lớp giáo lý khác theo thông báo của giáo xứ.", 6, null, 7, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatechismClasses");
        }
    }
}
