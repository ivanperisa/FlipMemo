using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class UserWordChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords");

            migrationBuilder.AddColumn<int>(
                name: "DictionaryId",
                table: "UserWords",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords",
                columns: new[] { "UserId", "WordId", "DictionaryId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserWords_DictionaryId",
                table: "UserWords",
                column: "DictionaryId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserWords_Dictionaries_DictionaryId",
                table: "UserWords",
                column: "DictionaryId",
                principalTable: "Dictionaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserWords_Dictionaries_DictionaryId",
                table: "UserWords");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords");

            migrationBuilder.DropIndex(
                name: "IX_UserWords_DictionaryId",
                table: "UserWords");

            migrationBuilder.DropColumn(
                name: "DictionaryId",
                table: "UserWords");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserWords",
                table: "UserWords",
                columns: new[] { "UserId", "WordId" });
        }
    }
}
