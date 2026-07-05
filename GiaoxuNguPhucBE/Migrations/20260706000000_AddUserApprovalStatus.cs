using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddUserApprovalStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // defaultValue = 1 (Approved) để mọi tài khoản ĐANG TỒN TẠI trước khi có tính năng
            // duyệt tài khoản vẫn đăng nhập được bình thường (coi như đã được duyệt từ trước).
            // Tài khoản đăng ký MỚI sau này sẽ được code (AuthService.RegisterAsync) set rõ ràng
            // = 0 (Pending), không phụ thuộc vào default này.
            migrationBuilder.AddColumn<int>(
                name: "ApprovalStatus",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalStatus",
                table: "Users");
        }
    }
}
