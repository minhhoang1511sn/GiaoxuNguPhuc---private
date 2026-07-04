using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddParishHistoryMilestonesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParishHistoryMilestones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Year = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Content = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParishHistoryMilestones", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ParishHistoryMilestones_DisplayOrder",
                table: "ParishHistoryMilestones",
                column: "DisplayOrder");

            // Seed vài mốc lược sử mặc định để tab "Lịch sử" có nội dung ngay sau khi
            // migrate, admin có thể sửa/xoá/thêm tiếp sau đó.
            migrationBuilder.InsertData(
                table: "ParishHistoryMilestones",
                columns: new[] { "Id", "Year", "Title", "Content", "ImageUrl", "DisplayOrder", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "1954", "Thành lập giáo xứ", "Giáo xứ Ngũ Phúc được thành lập, quy tụ những giáo dân đầu tiên về sinh hoạt đức tin chung quanh một nhà nguyện nhỏ.", null, 1, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "1975 - 1990", "Giai đoạn củng cố cộng đoàn", "Giáo xứ tiếp tục phát triển cộng đoàn, thành lập thêm các giới và đoàn thể phục vụ đời sống đức tin.", null, 2, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "2010", "Xây dựng nhà thờ mới", "Nhà thờ giáo xứ được xây dựng khang trang hơn để đáp ứng nhu cầu sinh hoạt ngày càng đông của giáo dân.", null, 3, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParishHistoryMilestones");
        }
    }
}
