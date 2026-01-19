using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Dictionaries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Language = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dictionaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MustChangePassword = table.Column<bool>(type: "boolean", nullable: false),
                    SecurityStamp = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    PasswordResetTokenHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Words",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SourceWord = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SourcePhrases = table.Column<List<string>>(type: "text[]", nullable: true),
                    TargetWord = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TargetPhrases = table.Column<List<string>>(type: "text[]", nullable: true),
                    AudioFile = table.Column<byte[]>(type: "bytea", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Words", x => x.Id);
                });

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

            migrationBuilder.CreateTable(
                name: "StudyProgresses",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    WordId = table.Column<int>(type: "integer", nullable: false),
                    DictionaryId = table.Column<int>(type: "integer", nullable: false),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    Box = table.Column<int>(type: "integer", nullable: false),
                    LastReviewed = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextReview = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Learned = table.Column<bool>(type: "boolean", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudyProgresses", x => new { x.UserId, x.WordId, x.DictionaryId, x.Mode });
                    table.ForeignKey(
                        name: "FK_StudyProgresses_Dictionaries_DictionaryId",
                        column: x => x.DictionaryId,
                        principalTable: "Dictionaries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudyProgresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudyProgresses_Words_WordId",
                        column: x => x.WordId,
                        principalTable: "Words",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DictionaryWord_WordsId",
                table: "DictionaryWord",
                column: "WordsId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyProgresses_DictionaryId",
                table: "StudyProgresses",
                column: "DictionaryId");

            migrationBuilder.CreateIndex(
                name: "IX_StudyProgresses_WordId",
                table: "StudyProgresses",
                column: "WordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DictionaryWord");

            migrationBuilder.DropTable(
                name: "StudyProgresses");

            migrationBuilder.DropTable(
                name: "Dictionaries");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Words");
        }
    }
}
