using FluentAssertions;
using FluentAssertions.Execution;
using Hippo.Booking.Core.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Hippo.Booking.Core.Tests.ExtensionTests;

public class PagedListTests
{
    private class TestDbContext(DbContextOptions<TestDbContext> options) : DbContext(options)
    {
        public DbSet<TestEntity> TestEntities { get; set; }
    }

    private class TestEntity
    {
        public int Id { get; set; }
    }

    [Test]
    public async Task TestToPagedListAsync()
    {
        var dbOptions = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase("PagedListTests")
            .Options;

        var dbContext = new TestDbContext(dbOptions);

        foreach (var i in Enumerable.Range(1, 10))
        {
            dbContext.TestEntities.Add(new TestEntity { Id = i });
        }

        await dbContext.SaveChangesAsync();

        var pagedList = await dbContext.TestEntities
            .ToPagedListAsync(2, 3);

        using (new AssertionScope())
        {
            pagedList.Page.Should().Be(2);
            pagedList.PageSize.Should().Be(3);
            pagedList.TotalCount.Should().Be(10);
            pagedList.Items.Should().HaveCount(3);
            pagedList.TotalPages.Should().Be(4);
        }
    }
}