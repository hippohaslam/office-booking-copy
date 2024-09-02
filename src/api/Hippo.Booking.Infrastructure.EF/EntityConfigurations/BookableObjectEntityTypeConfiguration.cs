using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Enums;
using Hippo.Booking.Core.Extensions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Hippo.Booking.Infrastructure.EF.EntityConfigurations;

public class BookableObjectEntityTypeConfiguration :
    IEntityTypeConfiguration<BookableObject>, 
    IEntityTypeConfiguration<BookableObjectType>
{
    public void Configure(EntityTypeBuilder<BookableObject> builder)
    {
        builder.HasKey(x => x.Id);
    }

    public void Configure(EntityTypeBuilder<BookableObjectType> builder)
    {
        builder.HasKey(x => x.Id);

        var enumData = Enum.GetValues<BookableObjectTypeEnum>();
        builder.HasData(enumData.Select(x => new BookableObjectType
        {
            Id = x,
            Name = x.ToString().ToFriendlyCase(),
            Description = x.GetEnumDescription()
        }));
    }
}