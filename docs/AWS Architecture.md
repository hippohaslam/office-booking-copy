# AWS Architecture

This is a basic representation of the AWS architecture for the project.

The architecture is composed of the following services:
- **Amplify** - Host the frontend react application
- **Beanstalk** - Host the backend .NET application
- **RDS** - Postgres database for the backend application

All services are hosted in the hippo internal AWS account within a seperate VPC.
All resources are tracked by terraform which can be found in [terraform](../src/infrastucture/terraform)
![AWS Architecture.png](.attachments%2FAWS%20Architecture.png)