using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    /// <inheritdoc />
    public partial class AdditionalSoftDeletes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Locations",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Locations",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "BookingWaitLists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "BookingWaitLists",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "BookableObjects",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "BookableObjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Areas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "Areas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Locations");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "BookingWaitLists");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "BookingWaitLists");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "BookableObjects");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "BookableObjects");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Areas");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "Areas");
        }
    }
}
