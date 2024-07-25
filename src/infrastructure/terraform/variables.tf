variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
}

variable "s3_terraform_bucket" {
  description = "S3 bucket to store Terraform state"
  type        = string
  default     = "hippo-booking-terraform-test"
}