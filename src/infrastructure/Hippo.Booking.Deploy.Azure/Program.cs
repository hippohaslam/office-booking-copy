using Pulumi.Azure.AppService;
using Pulumi.Azure.AppService.Inputs;
using Pulumi.Azure.Core;

return await Pulumi.Deployment.RunAsync(() =>
{
    var stackName = Pulumi.Deployment.Instance.StackName;

    string WithStackName(string name) => $"{name}-{stackName}";
    
    var rg = new ResourceGroup("booking-rg", new ResourceGroupArgs
    {
        Name = WithStackName("booking-rg"),
        Location = "West Europe"
    });
    
    var backEndAppServicePlan = new ServicePlan("booking-back-end-plan", new ServicePlanArgs
    {
        Name = WithStackName("booking-asp"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuName = "B1",
        OsType = "Linux"
    });
    
    var backEndAppService = new LinuxWebApp("booking-app-service", new LinuxWebAppArgs
    {
        Name = WithStackName("booking-app-service"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        ServicePlanId = backEndAppServicePlan.Id,
        AppSettings =
        {
            { "WEBSITE_RUN_FROM_PACKAGE", "1" }
        },
        SiteConfig = new LinuxWebAppSiteConfigArgs
        {
            AlwaysOn = true
        }
    });
    
    var frontEnd = new StaticWebApp("booking-static-web", new StaticWebAppArgs
    {
        Name = WithStackName("booking-static-web"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuTier = "Free"
    });
});