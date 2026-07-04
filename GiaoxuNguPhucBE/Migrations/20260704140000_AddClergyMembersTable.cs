using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddClergyMembersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClergyMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    FullName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MinistryName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SchoolYear = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    IsCurrent = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ImageUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Phone = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClergyMembers", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_ClergyMembers_IsCurrent_DisplayOrder",
                table: "ClergyMembers",
                columns: new[] { "IsCurrent", "DisplayOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_ClergyMembers_SchoolYear_Type",
                table: "ClergyMembers",
                columns: new[] { "SchoolYear", "Type" });

            // Seed dữ liệu mặc định, khớp với danh sách trước đây được viết cứng
            // ở frontend (views/About/About.jsx), để hành vi không đổi ngay sau khi
            // chuyển sang lấy dữ liệu từ DB.
            migrationBuilder.InsertData(
                table: "ClergyMembers",
                columns: new[] { "Id", "FullName", "Type", "Position", "MinistryName", "SchoolYear", "IsCurrent", "ImageUrl", "Email", "Phone", "Description", "DisplayOrder", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Lm. Giuse Nguyễn Văn An", 0, "Chánh xứ", null, "2024-2026", true, null, null, null, null, 1, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 2, "Lm. Phêrô Trần Văn Bình", 0, "Phó xứ", null, "2024-2026", true, null, null, null, null, 2, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 3, "Thầy Phó Tế Lê Văn Dũng", 1, "Phó tế", null, "2024-2026", true, null, null, null, null, 3, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) },
                    { 4, "Sr. Maria Celine", 2, "Phụ trách Giáo Lý", null, "2024-2026", true, null, null, null, null, 4, new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 7, 4, 0, 0, 0, DateTimeKind.Utc) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ClergyMembers");
        }
    }
}
