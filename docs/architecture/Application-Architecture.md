# Application Architecture

## System Landscape

This is a basic representation of the application hosted on AWS.

The architecture is composed of the following services:

- **Amplify** - Host the frontend react application
- **Beanstalk** - Host the backend .NET application
- **RDS** - Postgres database for the backend application

All services are hosted in the hippo internal AWS account within a separate VPC.
All resources are tracked by terraform which can be found in the [Terraform README](https://github.com/hippo-digital/office-booking/tree/main/src/infrastructure/terraform) folder.

![AWS Architecture.png](../attachments/AWS Architecture.png)
