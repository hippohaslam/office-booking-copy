# Infrastructure as Code

## S3 State file

The terraform state file is tracked in a S3 bucket "hippo-booking-terraform". If it doesn't exist use this command to create it:
```aws s3api create-bucket --bucket hippo-booking-terraform --region eu-west-1 --create-bucket-configuration LocationConstraint=eu-west-1```
