using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class UserWordModeId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords");

            migrationBuilder.AddColumn<int>(
                name: "ModeId",
                table: "UserWords",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords",
                columns: new[] { "UserId", "WordId", "ModeId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords");

            migrationBuilder.DropColumn(
                name: "ModeId",
                table: "UserWords");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords",
                columns: new[] { "UserId", "WordId" });
        }
    }
}
