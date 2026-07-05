using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddContactInfoTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContactInfos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    ParishName = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Address = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmergencyPhone = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Facebook = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Youtube = table.Column<string>(type: "varchar(300)", maxLength: 300, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Zalo = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MapEmbedUrl = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MapUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OfficeHours = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MassSchedule = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactInfos", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            // Seed đúng 1 bản ghi (Id = 1) làm "hàng singleton", điền tạm nội dung đang
            // hiển thị rải rác/set cứng ở FE (Contact.jsx, Footer.jsx, Library.jsx) để trang
            // web không bị trống khi vừa migrate xong — admin có thể sửa lại ngay sau đó
            // trong trang quản trị. Từ nay mọi nơi ở FE đều lấy dữ liệu từ đúng 1 bản ghi này.
            migrationBuilder.InsertData(
                table: "ContactInfos",
                columns: new[] { "Id", "ParishName", "Address", "Phone", "EmergencyPhone", "Email", "Facebook", "Youtube", "Zalo", "MapEmbedUrl", "MapUrl", "OfficeHours", "MassSchedule", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    {
                        1,
                        "Giáo xứ Ngũ Phúc",
                        "Hố Nai 3, Trảng Bom, Đồng Nai",
                        "(028) 3845 6789",
                        "090 123 4567",
                        "giaoxu@nguphuc.org",
                        null,
                        null,
                        null,
                        null,
                        null,
                        "Thứ 2 - Thứ 6: 08:00 - 17:00 | Thứ 7: 08:00 - 12:00 | Chúa nhật: Đóng cửa",
                        "Thứ 2 - Thứ 4 - Thứ 6: 4:30 | Thứ 3 - Thứ 5: 4:30 - 18:00 | Thứ 7: 4:30 - 18:00 | Chúa nhật: 4:30 - 7:30 - 17:00",
                        new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc),
                        new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc)
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactInfos");
        }
    }
}
