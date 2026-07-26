using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEmailUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // MySQL không cho tạo index trên cột kiểu TEXT/BLOB (longtext) mà không chỉ định
            // độ dài prefix, nên trước tiên đổi Email từ longtext -> varchar(255) (255 đủ dài
            // cho mọi email hợp lệ theo RFC 5321), sau đó mới tạo được unique index bên dưới.
            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            // LƯU Ý: nếu DB hiện tại đã có 2 user trùng Email (trước đây không có ràng buộc
            // unique), lệnh CreateIndex bên dưới sẽ FAIL. Hãy chạy trước:
            //   SELECT Email, COUNT(*) FROM Users GROUP BY Email HAVING COUNT(*) > 1;
            // và xử lý (đổi/gộp) các bản ghi trùng trước khi áp dụng migration này lên
            // môi trường production.
            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
