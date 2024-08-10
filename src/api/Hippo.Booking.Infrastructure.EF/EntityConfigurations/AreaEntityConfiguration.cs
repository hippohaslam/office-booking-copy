using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hippo.Booking.Infrastructure.EF.EntityConfigurations;

public class AreaEntityConfiguration :
    IEntityTypeConfiguration<Area>,
    IEntityTypeConfiguration<AreaType>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.HasKey(x => x.Id);
    }

    public void Configure(EntityTypeBuilder<AreaType> builder)
    {
        builder.HasKey(x => x.Id);

        var enumData = Enum.GetValues<AreaTypeEnum>();
        builder.HasData(enumData.Select(x => new AreaType
        {
            Id = x,
            Name = x.ToString().ToFriendlyCase(),
            Description = x.GetEnumDescription()
        }));
    }
}