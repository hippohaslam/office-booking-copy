﻿// <auto-generated />
using System;
using Hippo.Booking.Infrastructure.EF;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Hippo.Booking.Infrastructure.EF.Migrations
{
    [DbContext(typeof(HippoBookingDbContext))]
    [Migration("20250515103723_RemoveWaitingListCompound")]
    partial class RemoveWaitingListCompound
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.15")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Area", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AreaTypeId")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DeletedBy")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("FloorPlanJson")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("LocationId")
                        .HasColumnType("integer");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AreaTypeId");

                    b.HasIndex("LocationId");

                    b.ToTable("Areas");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.AreaType", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("integer");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("AreaTypes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Description = "Desks",
                            Name = "Desks"
                        },
                        new
                        {
                            Id = 2,
                            Description = "CarPark",
                            Name = "Car Park"
                        });
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookableObject", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AreaId")
                        .HasColumnType("integer");

                    b.Property<int>("BookableObjectTypeId")
                        .HasColumnType("integer");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DeletedBy")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("FloorplanObjectId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AreaId");

                    b.HasIndex("BookableObjectTypeId");

                    b.ToTable("BookableObjects");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookableObjectType", b =>
                {
                    b.Property<int>("Id")
                        .HasColumnType("integer");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("BookableObjectTypes");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Description = "Standard",
                            Name = "Standard"
                        },
                        new
                        {
                            Id = 2,
                            Description = "Dog",
                            Name = "Dog"
                        });
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Booking", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("BookableObjectId")
                        .HasColumnType("integer");

                    b.Property<string>("CalendarEventId")
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("CreatedBy")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateOnly>("Date")
                        .HasColumnType("date");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DeletedBy")
                        .HasColumnType("text");

                    b.Property<bool>("IsConfirmed")
                        .HasColumnType("boolean");

                    b.Property<string>("LastSlackMessageId")
                        .HasColumnType("text");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("BookableObjectId");

                    b.HasIndex("UserId");

                    b.ToTable("Bookings");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookingWaitList", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<int>("AreaId")
                        .HasColumnType("integer");

                    b.Property<DateOnly>("DateToBook")
                        .HasColumnType("date");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DeletedBy")
                        .HasColumnType("text");

                    b.Property<DateTime>("TimeQueued")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("AreaId");

                    b.HasIndex("UserId");

                    b.ToTable("BookingWaitLists");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Location", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime?>("DeletedAt")
                        .HasColumnType("timestamp with time zone");

                    b.Property<string>("DeletedBy")
                        .HasColumnType("text");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("GuideLink")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("SlackChannel")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Locations");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Report", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("ParametersJson")
                        .IsRequired()
                        .HasColumnType("jsonb");

                    b.Property<string>("ReportQuery")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Reports");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.ScheduledTask", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer");

                    NpgsqlPropertyBuilderExtensions.UseIdentityByDefaultColumn(b.Property<int>("Id"));

                    b.Property<DateOnly>("LastRunDate")
                        .IsConcurrencyToken()
                        .HasColumnType("date");

                    b.Property<string>("PayloadJson")
                        .IsRequired()
                        .HasColumnType("jsonb");

                    b.Property<string>("Task")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<TimeOnly>("TimeToRun")
                        .HasColumnType("time without time zone");

                    b.HasKey("Id");

                    b.ToTable("ScheduledTasks");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("text");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<bool>("IsAdmin")
                        .HasColumnType("boolean");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Area", b =>
                {
                    b.HasOne("Hippo.Booking.Core.Entities.AreaType", "AreaType")
                        .WithMany()
                        .HasForeignKey("AreaTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Hippo.Booking.Core.Entities.Location", "Location")
                        .WithMany("Areas")
                        .HasForeignKey("LocationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AreaType");

                    b.Navigation("Location");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookableObject", b =>
                {
                    b.HasOne("Hippo.Booking.Core.Entities.Area", "Area")
                        .WithMany("BookableObjects")
                        .HasForeignKey("AreaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Hippo.Booking.Core.Entities.BookableObjectType", "BookableObjectType")
                        .WithMany()
                        .HasForeignKey("BookableObjectTypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Area");

                    b.Navigation("BookableObjectType");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Booking", b =>
                {
                    b.HasOne("Hippo.Booking.Core.Entities.BookableObject", "BookableObject")
                        .WithMany("Bookings")
                        .HasForeignKey("BookableObjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Hippo.Booking.Core.Entities.User", "User")
                        .WithMany("Bookings")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("BookableObject");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookingWaitList", b =>
                {
                    b.HasOne("Hippo.Booking.Core.Entities.Area", "Area")
                        .WithMany()
                        .HasForeignKey("AreaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("Hippo.Booking.Core.Entities.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Area");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Area", b =>
                {
                    b.Navigation("BookableObjects");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.BookableObject", b =>
                {
                    b.Navigation("Bookings");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.Location", b =>
                {
                    b.Navigation("Areas");
                });

            modelBuilder.Entity("Hippo.Booking.Core.Entities.User", b =>
                {
                    b.Navigation("Bookings");
                });
#pragma warning restore 612, 618
        }
    }
}
