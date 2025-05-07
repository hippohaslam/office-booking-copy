using Hippo.Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hippo.Booking.Infrastructure.EF.EntityConfigurations;

public class BookingWaitListEntityConfiguration : IEntityTypeConfiguration<BookingWaitList>
{
    public void Configure(EntityTypeBuilder<BookingWaitList> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.UserId, x.AreaId, x.DateToBook });
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Area>(x => x.Area)
            .WithMany()
            .HasForeignKey(x => x.AreaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}