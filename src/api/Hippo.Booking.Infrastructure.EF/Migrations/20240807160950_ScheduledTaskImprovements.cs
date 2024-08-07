using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class ScheduledTaskImprovements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ScheduledTasks",
                table: "ScheduledTasks");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "ScheduledTasks",
                type: "integer",
                nullable: false,
                defaultValue: 0)
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "PayloadJson",
                table: "ScheduledTasks",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TimeZoneId",
                table: "ScheduledTasks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ScheduledTasks",
                table: "ScheduledTasks",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ScheduledTasks",
                table: "ScheduledTasks");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "ScheduledTasks");

            migrationBuilder.DropColumn(
                name: "PayloadJson",
                table: "ScheduledTasks");

            migrationBuilder.DropColumn(
                name: "TimeZoneId",
                table: "ScheduledTasks");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ScheduledTasks",
                table: "ScheduledTasks",
                column: "Task");
        }
    }
}
