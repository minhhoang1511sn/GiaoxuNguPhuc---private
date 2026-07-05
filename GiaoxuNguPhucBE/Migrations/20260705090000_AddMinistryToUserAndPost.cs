using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GiaoxuNguPhucBE.Migrations
{
    /// <inheritdoc />
    public partial class AddMinistryToUserAndPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MinistryId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinistryId",
                table: "Posts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_MinistryId",
                table: "Users",
                column: "MinistryId");

            migrationBuilder.CreateIndex(
                name: "IX_Posts_MinistryId",
                table: "Posts",
                column: "MinistryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Ministries_MinistryId",
                table: "Users",
                column: "MinistryId",
                principalTable: "Ministries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Ministries_MinistryId",
                table: "Posts",
                column: "MinistryId",
                principalTable: "Ministries",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Ministries_MinistryId",
                table: "Users");

            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Ministries_MinistryId",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Users_MinistryId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Posts_MinistryId",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "MinistryId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "MinistryId",
                table: "Posts");
        }
    }
}