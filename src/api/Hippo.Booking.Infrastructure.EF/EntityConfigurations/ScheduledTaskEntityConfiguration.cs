using Hippo.Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hippo.Booking.Infrastructure.EF.EntityConfigurations;

public class ScheduledTaskEntityConfiguration : IEntityTypeConfiguration<ScheduledTask>
{
    public void Configure(EntityTypeBuilder<ScheduledTask> builder)
    {
        builder.HasKey(x => x.Task);
    }
}