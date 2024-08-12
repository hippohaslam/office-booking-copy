using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class ScheduleChangesToDay : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CronExpression",
                table: "ScheduledTasks");

            migrationBuilder.DropColumn(
                name: "TimeZoneId",
                table: "ScheduledTasks");

            migrationBuilder.AddColumn<DateOnly>(
                name: "LastRunDate",
                table: "ScheduledTasks",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "TimeToRun",
                table: "ScheduledTasks",
                type: "time without time zone",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastRunDate",
                table: "ScheduledTasks");

            migrationBuilder.DropColumn(
                name: "TimeToRun",
                table: "ScheduledTasks");

            migrationBuilder.AddColumn<string>(
                name: "CronExpression",
                table: "ScheduledTasks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TimeZoneId",
                table: "ScheduledTasks",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
