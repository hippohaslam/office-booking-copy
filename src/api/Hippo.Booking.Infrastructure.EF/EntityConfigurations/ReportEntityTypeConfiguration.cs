using Hippo.Booking.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hippo.Booking.Infrastructure.EF.EntityConfigurations;

public class ReportEntityTypeConfiguration : IEntityTypeConfiguration<Report>
{
    public void Configure(EntityTypeBuilder<Report> builder)
    {
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => x.Name).IsUnique();
        
        builder.Property(x => x.ParametersJson).HasColumnType("jsonb");
    }
}