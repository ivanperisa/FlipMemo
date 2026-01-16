using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class VoiceRelationUserWord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Voices_UserId",
                table: "Voices");

            migrationBuilder.AddColumn<int>(
                name: "DictionaryId",
                table: "Voices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Voices_DictionaryId",
                table: "Voices",
                column: "DictionaryId");

            migrationBuilder.CreateIndex(
                name: "IX_Voices_UserId_WordId_DictionaryId",
                table: "Voices",
                columns: new[] { "UserId", "WordId", "DictionaryId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Voices_Dictionaries_DictionaryId",
                table: "Voices",
                column: "DictionaryId",
                principalTable: "Dictionaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Voices_UserWords_UserId_WordId_DictionaryId",
                table: "Voices",
                columns: new[] { "UserId", "WordId", "DictionaryId" },
                principalTable: "UserWords",
                principalColumns: new[] { "UserId", "WordId", "DictionaryId" },
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Voices_Dictionaries_DictionaryId",
                table: "Voices");

            migrationBuilder.DropForeignKey(
                name: "FK_Voices_UserWords_UserId_WordId_DictionaryId",
                table: "Voices");

            migrationBuilder.DropIndex(
                name: "IX_Voices_DictionaryId",
                table: "Voices");

            migrationBuilder.DropIndex(
                name: "IX_Voices_UserId_WordId_DictionaryId",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "DictionaryId",
                table: "Voices");

            migrationBuilder.CreateIndex(
                name: "IX_Voices_UserId",
                table: "Voices",
                column: "UserId");
        }
    }
}
