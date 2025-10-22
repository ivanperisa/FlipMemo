using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class DictionaryRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DictionaryWords_Dictionaries_DictionaryId",
                table: "DictionaryWords");

            migrationBuilder.DropForeignKey(
                name: "FK_DictionaryWords_Words_WordId",
                table: "DictionaryWords");

            migrationBuilder.RenameColumn(
                name: "WordId",
                table: "DictionaryWords",
                newName: "WordsId");

            migrationBuilder.RenameColumn(
                name: "DictionaryId",
                table: "DictionaryWords",
                newName: "DictionariesId");

            migrationBuilder.RenameIndex(
                name: "IX_DictionaryWords_WordId",
                table: "DictionaryWords",
                newName: "IX_DictionaryWords_WordsId");

            migrationBuilder.AddForeignKey(
                name: "FK_DictionaryWords_Dictionaries_DictionariesId",
                table: "DictionaryWords",
                column: "DictionariesId",
                principalTable: "Dictionaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DictionaryWords_Words_WordsId",
                table: "DictionaryWords",
                column: "WordsId",
                principalTable: "Words",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DictionaryWords_Dictionaries_DictionariesId",
                table: "DictionaryWords");

            migrationBuilder.DropForeignKey(
                name: "FK_DictionaryWords_Words_WordsId",
                table: "DictionaryWords");

            migrationBuilder.RenameColumn(
                name: "WordsId",
                table: "DictionaryWords",
                newName: "WordId");

            migrationBuilder.RenameColumn(
                name: "DictionariesId",
                table: "DictionaryWords",
                newName: "DictionaryId");

            migrationBuilder.RenameIndex(
                name: "IX_DictionaryWords_WordsId",
                table: "DictionaryWords",
                newName: "IX_DictionaryWords_WordId");

            migrationBuilder.AddForeignKey(
                name: "FK_DictionaryWords_Dictionaries_DictionaryId",
                table: "DictionaryWords",
                column: "DictionaryId",
                principalTable: "Dictionaries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DictionaryWords_Words_WordId",
                table: "DictionaryWords",
                column: "WordId",
                principalTable: "Words",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
