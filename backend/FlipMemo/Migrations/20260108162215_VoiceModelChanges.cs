using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipMemo.Migrations
{
    /// <inheritdoc />
    public partial class VoiceModelChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Score",
                table: "Voices",
                newName: "SpeakingScore");

            migrationBuilder.RenameColumn(
                name: "LastReviewed",
                table: "Voices",
                newName: "SpeakingNextReview");

            migrationBuilder.AlterColumn<byte[]>(
                name: "AudioFile",
                table: "Words",
                type: "bytea",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ListeningBox",
                table: "Voices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ListeningLastReviewed",
                table: "Voices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ListeningLearned",
                table: "Voices",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "ListeningNextReview",
                table: "Voices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SpeakingBox",
                table: "Voices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SpeakingLastReviewed",
                table: "Voices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SpeakingLearned",
                table: "Voices",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ListeningBox",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "ListeningLastReviewed",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "ListeningLearned",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "ListeningNextReview",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "SpeakingBox",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "SpeakingLastReviewed",
                table: "Voices");

            migrationBuilder.DropColumn(
                name: "SpeakingLearned",
                table: "Voices");

            migrationBuilder.RenameColumn(
                name: "SpeakingScore",
                table: "Voices",
                newName: "Score");

            migrationBuilder.RenameColumn(
                name: "SpeakingNextReview",
                table: "Voices",
                newName: "LastReviewed");

            migrationBuilder.AlterColumn<string>(
                name: "AudioFile",
                table: "Words",
                type: "text",
                nullable: true,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldNullable: true);
        }
    }
}
