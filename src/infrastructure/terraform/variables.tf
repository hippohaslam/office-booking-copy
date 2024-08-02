variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google Client Id"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google Client Secret"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "Github repository URL"
  type        = string
}

variable "github_access_token" {
  description = "Github access token"
  type        = string
  sensitive   = true
}

variable "s3_terraform_bucket" {
  description = "S3 bucket to store Terraform state"
  type        = string
  default     = "hippo-booking-terraform-test"
}

variable "frontend_subdomain" {
  description = "Frontend Subdomain"
  type        = string
  default     = "bookingtest"
}

variable "backend_subdomain" {
  description = "Backend Subdomain"
  type        = string
  default     = "bookingapitest"
}

variable "hosted_zone_url" {
  description = "Hosted Zone URL"
  type        = string
  default     = "internal.hippodigital.cloud"
}