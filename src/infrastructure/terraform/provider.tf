terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "3.6.3"
    }
  }

  backend "s3" {}
}

# Configure the AWS Provider
provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      Service     = "Office Booking"
      Environment = var.environment
    }
  }
}