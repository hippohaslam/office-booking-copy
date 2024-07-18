using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class ScheduledTask : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScheduledTasks",
                columns: table => new
                {
                    Task = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CronExpression = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScheduledTasks", x => x.Task);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScheduledTasks");
        }
    }
}
