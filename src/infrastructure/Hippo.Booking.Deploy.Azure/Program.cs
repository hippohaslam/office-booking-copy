using Pulumi;
using Pulumi.Azure.AppService;
using Pulumi.Azure.AppService.Inputs;
using Pulumi.Azure.Core;

return await Pulumi.Deployment.RunAsync(() =>
{
    var stackName = Pulumi.Deployment.Instance.StackName;

    string WithStackName(string name) => $"{name}-{stackName}";
    
    var config = new Config();
    
    var rg = new ResourceGroup("hippo-booking-rg", new ResourceGroupArgs
    {
        Name = WithStackName("hippo-booking-rg"),
        Location = "West Europe"
    });
    
    var backEndAppServicePlan = new ServicePlan("hippo-booking-back-end-plan", new ServicePlanArgs
    {
        Name = WithStackName("hippo-booking-asp"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuName = "B1",
        OsType = "Linux"
    });
    
    var backEndAppService = new LinuxWebApp("hippo-booking-app-service", new LinuxWebAppArgs
    {
        Name = WithStackName("hippo-booking-app-service"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        ServicePlanId = backEndAppServicePlan.Id,
        AppSettings =
        {
            { "DOCKER_REGISTRY_SERVER_URL", "ghcr.io" },
            { "DOCKER_REGISTRY_SERVER_USERNAME" , config.Require("DockerUsername")},
            { "DOCKER_REGISTRY_SERVER_PASSWORD", config.RequireSecret("DockerPassword")}
        },
        SiteConfig = new LinuxWebAppSiteConfigArgs
        {
            AlwaysOn = true
        }
    });
    
    var frontEnd = new StaticWebApp("hippo-booking-static-web", new StaticWebAppArgs
    {
        Name = WithStackName("hippo-booking-static-web"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuTier = "Free"
    });
});