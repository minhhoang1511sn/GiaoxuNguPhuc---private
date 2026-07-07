using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddParishCalendarEventsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ParishCalendarEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Title = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EventDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EventType = table.Column<int>(type: "int", nullable: false),
                    TimeLabel = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Location = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParishCalendarEvents", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ParishCalendarEvents_EventDate",
                table: "ParishCalendarEvents",
                column: "EventDate");

            // Seed vài mục mẫu để tab "Lịch lễ riêng" có nội dung ngay sau khi migrate,
            // admin có thể sửa/xoá/thêm tiếp sau đó.
            migrationBuilder.InsertData(
                table: "ParishCalendarEvents",
                columns: new[] { "Id", "Title", "Description", "EventDate", "EventType", "TimeLabel", "Location", "DisplayOrder", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Lễ Bổn mạng Giáo xứ", "Thánh lễ trọng thể mừng Bổn mạng, sau lễ có tiệc mừng cộng đoàn.", new DateTime(2026, 10, 25, 18, 0, 0, DateTimeKind.Utc), 0, "18:00", null, 1, new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Họp Hội đồng Mục vụ Giáo xứ", "Họp thường kỳ Hội đồng Mục vụ để chuẩn bị các sinh hoạt tháng tới.", new DateTime(2026, 7, 20, 19, 30, 0, DateTimeKind.Utc), 2, "19:30", "Hội trường giáo xứ", 1, new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 7, 0, 0, 0, DateTimeKind.Utc) },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParishCalendarEvents");
        }
    }
}
