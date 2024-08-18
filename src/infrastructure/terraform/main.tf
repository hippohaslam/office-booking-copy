locals {
  region = "eu-west-1"
}

resource "aws_vpc" "hippo-booking-vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true

  tags = {
    Name = "Hippo Booking ${var.environment} VPC"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.hippo-booking-vpc.id
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.hippo-booking-vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.hippo-booking-vpc.id
}

data "aws_route53_zone" "hippo-internal-zone" {
  name = "internal.hippodigital.cloud"
}

data "aws_elastic_beanstalk_hosted_zone" "current" {}

resource "aws_route53_record" "backend_record" {
  zone_id = data.aws_route53_zone.hippo-internal-zone.zone_id
  name    = "${var.backend_subdomain}.${var.hosted_zone_url}"
  type    = "A"
  #records = [aws_elastic_beanstalk_environment.hippo-booking-api-env.cname]

  alias {
    name                   = aws_elastic_beanstalk_environment.hippo-booking-api-env.cname
    zone_id                = data.aws_elastic_beanstalk_hosted_zone.current.id
    evaluate_target_health = true
  }
}

resource "aws_acm_certificate" "backend_certificate" {
  domain_name       = "${var.backend_subdomain}.${var.hosted_zone_url}"
  validation_method = "DNS"
}

resource "aws_route53_record" "backend_cert_route53_record" {
  for_each = {
    for dvo in aws_acm_certificate.backend_certificate.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.hippo-internal-zone.zone_id
}

resource "aws_acm_certificate_validation" "backend_cert_validation" {
  certificate_arn         = aws_acm_certificate.backend_certificate.arn
  validation_record_fqdns = [for record in aws_route53_record.backend_cert_route53_record : record.fqdn]
}