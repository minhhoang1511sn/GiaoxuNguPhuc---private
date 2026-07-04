using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddMinistriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Ministries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Category = table.Column<int>(type: "int", nullable: false),
                    CategoryLabel = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Icon = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ministries", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Ministries_IsActive_DisplayOrder",
                table: "Ministries",
                columns: new[] { "IsActive", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Ministries_Category",
                table: "Ministries",
                column: "Category");

            // Seed dữ liệu mặc định, khớp với danh sách trước đây được viết cứng
            // ở frontend (views/Ministry/Ministry.jsx), để hành vi không đổi ngay
            // sau khi chuyển sang lấy dữ liệu từ DB.
            migrationBuilder.InsertData(
                table: "Ministries",
                columns: new[] { "Id", "Name", "Category", "CategoryLabel", "Description", "ImageUrl", "Icon", "DisplayOrder", "IsActive", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Ca Đoàn Têrêsa", 0, "Phụng vụ", "Hát khen ngợi Chúa, phục vụ thánh nhạc trong các thánh lễ trọng thể và ngày Chúa Nhật.", null, "🎵", 1, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Giới Trẻ Đa Minh", 1, "Giới trẻ", "Xây dựng tình bạn và đức tin năng động cho người trẻ qua các buổi sinh hoạt và trại hè.", null, "👥", 2, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Ban Caritas", 2, "Xã hội & Bác ái", "Chia sẻ yêu thương, giúp đỡ người nghèo, bệnh nhân và những hoàn cảnh khó khăn trong giáo xứ.", null, "❤️", 3, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "Giáo Lý Viên", 3, "Giáo dục", "Ươm mầm và nuôi dưỡng đức tin cho thế hệ tương lai thông qua các lớp giáo lý Chúa Nhật.", null, "📖", 4, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 5, "Hội Các Bà Mẹ", 2, "Xã hội & Gia đình", "Cầu nguyện và hỗ trợ các gia đình trong giáo xứ, noi gương các thánh nữ.", null, "🙏", 5, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 6, "Legio Mariae", 0, "Phụng vụ", "Đạo binh Đức Mẹ, hoạt động tông đồ giáo dân, thăm viếng và cầu nguyện cho người đau yếu.", null, "⛪", 6, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 7, "Ban Lễ Sinh", 0, "Phụng vụ", "Phục vụ bàn thờ Chúa trong các thánh lễ, rèn luyện đức tính kỷ luật và đạo đức.", null, "✝️", 7, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 8, "Ban Khánh Tiết", 2, "Hậu cần", "Trang trí nhà thờ, cắm hoa và chuẩn bị không gian trang nghiêm cho các ngày lễ lớn.", null, "🌸", 8, true, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ministries");
        }
    }
}
