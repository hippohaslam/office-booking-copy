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

variable "google_client_secret" {
  description = "Google Client Secret"
  type        = string
  sensitive   = true
}

variable "slack_token" {
  description = "Slack Token"
  type        = string
  sensitive   = true
}

variable "slack_signing_secret" {
  description = "Slack Signing Secret"
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

variable "environment" {
  description = "Environment"
  type        = string
}

variable "env_suffix" {
  description = "Environment Suffix"
  type        = string
}

variable "frontend_subdomain" {
  description = "Frontend Subdomain"
  type        = string
}

variable "backend_subdomain" {
  description = "Backend Subdomain"
  type        = string
}

variable "hosted_zone_url" {
  description = "Hosted Zone URL"
  type        = string
}

variable "db_instance_size" {
  description = "DB Instance Size"
  type        = string
}