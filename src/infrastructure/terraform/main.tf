locals {
  region = "eu-west-1"
  tags = {
    App         = "HippoBooking"
    Environment = "Test"
  }
}

resource "aws_vpc" "hippo-booking-vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.hippo-booking-vpc.id
  
  tags = local.tags
}

resource "aws_route_table" "route_table" {
  vpc_id = aws_vpc.hippo-booking-vpc.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}