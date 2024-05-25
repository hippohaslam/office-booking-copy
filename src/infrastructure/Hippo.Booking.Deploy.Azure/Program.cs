using Pulumi;
using Pulumi.Azure.AppService;
using Pulumi.Azure.AppService.Inputs;
using Pulumi.Azure.Core;
using Pulumi.Azure.Sql;
using Pulumi.Random;

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
    
    var frontEnd = new StaticWebApp("hippo-booking-static-web", new StaticWebAppArgs
    {
        Name = WithStackName("hippo-booking-static-web"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuTier = "Free"
    });
    
    var randomDbPassword = new RandomPassword("hippo-booking-db-password", new RandomPasswordArgs
    {
        Length = 16,
        Special = true
    });
    
    var sqlServer = new SqlServer("hippo-booking-sql-server", new SqlServerArgs
    {
        Name = WithStackName("hippo-booking-sql-server"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        Version = "12.0",
        AdministratorLogin = "admin",
        AdministratorLoginPassword = randomDbPassword.Result
    });
    
    var sqlDatabase = new Database("hippo-booking-sql-database", new DatabaseArgs
    {
        Name = WithStackName("hippo-booking-sql-database"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        ServerName = sqlServer.Name,
        RequestedServiceObjectiveName = "S0"
    });
    
    var backEndAppServicePlan = new ServicePlan("hippo-booking-back-end-plan", new ServicePlanArgs
    {
        Name = WithStackName("hippo-booking-asp"),
        ResourceGroupName = rg.Name,
        Location = rg.Location,
        SkuName = "B1",
        OsType = "Linux"
    });

    var connectionString = Output.Tuple(sqlServer.Name, sqlDatabase.Name, sqlServer.AdministratorLoginPassword)
        .Apply(t =>
        {
            var (serverName, databaseName, password) = t;
            return
                $"Server=tcp:{serverName}.database.windows.net;initial catalog={databaseName};user ID={sqlServer.AdministratorLogin};password={password};Min Pool Size=0;Max Pool Size=30;Persist Security Info=True;";
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