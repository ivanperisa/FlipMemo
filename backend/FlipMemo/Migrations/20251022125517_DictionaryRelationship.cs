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
            // Ensure the DictionaryWord table exists and has proper constraints
            migrationBuilder.CreateTable(
                name: "DictionaryWord",
                columns: table => new
                {
                    DictionariesId = table.Column<int>(type: "integer", nullable: false),
                    WordsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DictionaryWord", x => new { x.DictionariesId, x.WordsId });
                    table.ForeignKey(
                        name: "FK_DictionaryWord_Dictionaries_DictionariesId",
                        column: x => x.DictionariesId,
                        principalTable: "Dictionaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DictionaryWord_Words_WordsId",
                        column: x => x.WordsId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DictionaryWord_WordsId",
                table: "DictionaryWord",
                column: "WordsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the table if you ever revert this migration
            migrationBuilder.DropTable(
                name: "DictionaryWord");
        }
    }
}
