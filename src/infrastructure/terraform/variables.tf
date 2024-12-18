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
  default     = "internal.hippodigital.cloud"
}

variable "beanstalk_instance_type" {
  description = "Beanstalk Instance Type"
  type        = string
}

variable "db_instance_size" {
  description = "DB Instance Size"
  type        = string
}

variable "db_retention_period" {
  description = "How many days to retain a DB backup"
  type        = number
}

variable "email_recipients_alarms" {
  description = "Who will receive emails for alarms, i.e. when health degrades"
  type        = set(string)
}

variable "slack_channel_email" {
  description = "Slack channel email to send AWS Alarm alerts to"
  type        = string
}

variable "enable_db_public_access" {
  description = "Enable public access to the database"
  type        = bool
  default     = false
}

variable "provision_bastion" {
  description = "Whether to provision a bastion host"
  type        = bool
  default     = true
}