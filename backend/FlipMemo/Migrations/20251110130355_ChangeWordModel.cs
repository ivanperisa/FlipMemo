using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class ChangeWordModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CroatianPhrases",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "ForeignPhrase",
                table: "Words");

            migrationBuilder.RenameColumn(
                name: "ForeignWord",
                table: "Words",
                newName: "SourceWord");

            migrationBuilder.RenameColumn(
                name: "CroatianWord",
                table: "Words",
                newName: "TargetWord");

            migrationBuilder.AddColumn<List<string>>(
                name: "SourcePhrases",
                table: "Words",
                type: "text[]",
                nullable: true);

            migrationBuilder.AddColumn<List<string>>(
                name: "TargetPhrases",
                table: "Words",
                type: "text[]",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourcePhrases",
                table: "Words");

            migrationBuilder.DropColumn(
                name: "TargetPhrases",
                table: "Words");

            migrationBuilder.RenameColumn(
                name: "TargetWord",
                table: "Words",
                newName: "CroatianWord");

            migrationBuilder.RenameColumn(
                name: "SourceWord",
                table: "Words",
                newName: "ForeignWord");

            migrationBuilder.AddColumn<string>(
                name: "CroatianPhrases",
                table: "Words",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ForeignPhrase",
                table: "Words",
                type: "text",
                nullable: true);
        }
    }
}
