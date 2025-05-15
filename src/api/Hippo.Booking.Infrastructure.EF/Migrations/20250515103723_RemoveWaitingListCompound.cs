using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class RemoveWaitingListCompound : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_BookingWaitLists_UserId_AreaId_DateToBook",
                table: "BookingWaitLists");

            migrationBuilder.CreateIndex(
                name: "IX_BookingWaitLists_UserId",
                table: "BookingWaitLists",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookingWaitLists_UserId",
                table: "BookingWaitLists");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_BookingWaitLists_UserId_AreaId_DateToBook",
                table: "BookingWaitLists",
                columns: new[] { "UserId", "AreaId", "DateToBook" });
        }
    }
}
