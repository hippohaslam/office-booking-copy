using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class GoogleEventId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CalendarEventId",
                table: "Bookings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CalendarEventId",
                table: "Bookings");
        }
    }
}
