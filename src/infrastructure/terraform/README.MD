# Terraform

This directory contains the Terraform configuration for the infrastructure of the project.

To work with this terraform properly you will need to **install the AWS CLI** and **setup credentials to the Hippo Internal AWS account**

## S3 State file

The terraform state file is tracked in a S3 bucket "hippo-booking-terraform".
If for whatever reason it doesn't exist use this command to create it:
```aws s3api create-bucket --bucket hippo-booking-terraform --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1```

## Getting Started

To get started with Terraform, you will need to install the Terraform CLI.
You can find the installation instructions [here](https://learn.hashicorp.com/tutorials/terraform/install-cli).

Once you have the CLI installed, you can run the following commands to play around against the test environment:

- ```terraform init --backend-config="bucket=hippo-booking-terraform" --backend-config="key=terraform.Test.tfstate" --backend-config="region=eu-west-1"```
- ```terraform plan -var-file="Test.tfvars"```
- ```terraform apply -var-file="Test.tfvars"```

**Important note: Please don't connect to the production environment unless you are confident with what you are doing, as this runs the risk of affecting the live system and potential data loss.**
