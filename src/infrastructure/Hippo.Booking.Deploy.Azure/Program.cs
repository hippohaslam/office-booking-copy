using Pulumi.Azure.Core;

return await Pulumi.Deployment.RunAsync(() =>
{
    var rg = new ResourceGroup("booking-rg", new ResourceGroupArgs
    {
        Name = "booking-rg",
        Location = "West Europe"
    });
});