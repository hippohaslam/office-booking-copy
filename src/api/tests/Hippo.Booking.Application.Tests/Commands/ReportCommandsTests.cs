using System.Text.Json;
using FluentAssertions;
using Hippo.Booking.Application.Commands.Reports;
using Hippo.Booking.Application.Exceptions;
using Hippo.Booking.Core.Entities;
using Hippo.Booking.Core.Interfaces;
using NSubstitute;

namespace Hippo.Booking.Application.Tests.Commands;

public class ReportCommandsTests
{
    private ReportingCommands _sut;
    private IDataContext _dataContext;
    private IReportRunner _reportRunner;
    private Report _report;

    [OneTimeSetUp]
    public async Task Setup()
    {
        _dataContext = TestHelpers.GetDbContext(nameof(AreaCommandsTests));

        _report = new Report
        {
            Name = "Test",
            Description = "Description",
            ParametersJson = "{}",
            ReportQuery = "SELECT * FROM Test"
        };
        
        _dataContext.AddEntity(_report);

        await _dataContext.Save();

        _reportRunner = Substitute.For<IReportRunner>();
        _reportRunner.RunReport(Arg.Any<Report>(), Arg.Any<Dictionary<string, JsonElement>>())
            .Returns(new ReportResponse
            {
                Response = [],
                Success = true
            });

        _sut = new ReportingCommands(
            _dataContext,
            _reportRunner);
    }

    [Test]
    public async Task CanRunReport()
    {
        var parameters = new Dictionary<string, JsonElement>
        {
            { "test1", JsonDocument.Parse("{}").RootElement }
        };

        var result = await _sut.Handle(_report.Id, parameters);

        result.Should().BeEquivalentTo(new ReportResponse
        {
            Response = [],
            Success = true
        });

        await _reportRunner.Received(1).RunReport(_report, parameters);
    }

    [Test]
    public async Task CannotRunReportThatDoesNotExist()
    {
        var parameters = new Dictionary<string, JsonElement>
        {
            { "test2", JsonDocument.Parse("{}").RootElement }
        };

        Assert.ThrowsAsync<ClientException>(async () => await _sut.Handle(0, parameters));

        await _reportRunner.DidNotReceive().RunReport(_report, parameters);
    }
}