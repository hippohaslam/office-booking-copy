using Pulumi;
using Pulumi.Azure.AppService;
using Pulumi.Azure.AppService.Inputs;
using Pulumi.Azure.Core;
using Pulumi.Azure.MSSql;
using Pulumi.Random;

return await Pulumi.Deployment.RunAsync(() =>
{
    var stackName = Pulumi.Deployment.Instance.StackName;

    string WithStackName(string name) => $"{name}-{stackName}";
    
    var config = new Config();
    
    var rg = new ResourceGroup("hippo-booking-rg", new ResourceGroupArgs
    {
        Name = WithStackName("hippo-booking-rg"),
        Location = "UK South"
    });
    
    var frontEnd = new StaticWebApp("hippo-booking-static-web", new StaticWebAppArgs
    {
        Name = WithStackName("hippo-booking-static-web"),
        ResourceGroupName = rg.Name,
        Location = "West Europe",
        SkuTier = "Free"
    });
    
    var randomDbPassword = new RandomPassword("hippo-booking-db-password", new RandomPasswordArgs
    {
        Length = 16,
        Special = true
    });
    
    var sqlServer = new Server("hippo-booking-sql-server", new ServerArgs
    {
        Name = WithStackName("hippo-booking-sql-server"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        Version = "12.0",
        AdministratorLogin = "hippobookingadmin",
        AdministratorLoginPassword = randomDbPassword.Result
    });

    var sqlFirewallRule = new FirewallRule("hippo-booking-sql-firewall-rule-azure-services", new FirewallRuleArgs
    {
        EndIpAddress = "0.0.0.0",
        Name = "AllowAllWindowsAzureIps",
        ServerId = sqlServer.Id,
        StartIpAddress = "0.0.0.0",
    });
    
    var sqlDatabase = new Database("hippo-booking-sql-database", new DatabaseArgs
    {
        Name = WithStackName("hippo-booking-db"),
        ServerId = sqlServer.Id,
        SkuName = "S0"
    });
    
    var backEndAppServicePlan = new ServicePlan("hippo-booking-back-end-plan", new ServicePlanArgs
    {
        Name = WithStackName("hippo-booking-asp"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuName = "B1",
        OsType = "Linux"
    });

    var connectionString = Output.Tuple(sqlServer.Name, sqlDatabase.Name, sqlServer.AdministratorLogin, sqlServer.AdministratorLoginPassword)
        .Apply(t =>
        {
            var (serverName, databaseName, login, password) = t;
            return
                $"Server=tcp:{serverName}.database.windows.net;initial catalog={databaseName};user ID={login};password={password};Min Pool Size=0;Max Pool Size=30;Persist Security Info=True;";
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
            { "DOCKER_REGISTRY_SERVER_PASSWORD", config.RequireSecret("DockerPassword")},
            { "ConnectionStrings__HippoBookingDbContext", connectionString}
        },
        SiteConfig = new LinuxWebAppSiteConfigArgs
        {
            AlwaysOn = true
        }
    });
});