resource "aws_elastic_beanstalk_application" "hippo-booking-api" {
  name        = "hippo-booking-api-${var.env_suffix}"
  description = "Elastic Beanstalk application for .NET API"
}

resource "aws_subnet" "hippo-booking-api-subnet-a" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "eu-west-1a"
}

resource "aws_subnet" "hippo-booking-api-subnet-b" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.5.0/24"
  availability_zone = "eu-west-1b"
}
resource "aws_route_table_association" "hippo-booking-api-subnet-a-routing" {
  subnet_id      = aws_subnet.hippo-booking-api-subnet-a.id
  route_table_id = aws_route_table.route_table.id
}
resource "aws_route_table_association" "hippo-booking-api-subnet-b-routing" {
  subnet_id      = aws_subnet.hippo-booking-api-subnet-b.id
  route_table_id = aws_route_table.route_table.id
}

resource "aws_security_group" "beanstalk_sg" {
  name        = "beanstalk-sg-${var.env_suffix}"
  description = "Security group for Elastic Beanstalk"
  vpc_id      = aws_vpc.hippo-booking-vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.tags
}

resource "aws_elastic_beanstalk_environment" "hippo-booking-api-env" {
  name                = "hippo-booking-api-env-${var.env_suffix}"
  application         = aws_elastic_beanstalk_application.hippo-booking-api.name
  solution_stack_name = "64bit Amazon Linux 2023 v3.1.3 running .NET 8"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
    resource  = ""
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.beanstalk_sg.id
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "LoadBalancerType"
    value     = "application"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Port"
    value     = "80"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "Protocol"
    value     = "HTTP"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/health"
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "ListenerEnabled"
    value     = "true"
    resource  = ""
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "Protocol"
    value     = "HTTPS"
    resource  = ""
  }

  setting {
    namespace = "aws:elbv2:listener:443"
    name      = "SSLCertificateArns"
    value     = aws_acm_certificate.backend_certificate.arn
    resource  = ""
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = "1"
    resource  = ""
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = "1"
    resource  = ""
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.hippo-booking-vpc.id
    resource  = ""
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", [aws_subnet.hippo-booking-api-subnet-a.id, aws_subnet.hippo-booking-api-subnet-b.id])
    resource  = ""
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ASPNETCORE_ENVIRONMENT"
    value     = "Test"
    resource  = ""
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "True"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ConnectionStrings__HippoBookingDbContext"
    value     = "Server=${aws_db_instance.hippo-booking-db.address};Port=${aws_db_instance.hippo-booking-db.port};User Id=${aws_db_instance.hippo-booking-db.username};Password=${aws_db_instance.hippo-booking-db.password};Database=HippoBooking_Test"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Aws__AccessKeyId"
    value     = var.aws_access_key_id
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Aws__AccessSecretKey"
    value     = var.aws_secret_access_key
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Google__ClientSecret"
    value     = var.google_client_secret
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Slack__Token"
    value     = var.slack_token
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Slack__SigningSecret"
    value     = var.slack_signing_secret
    resource  = ""
  }

  tags = local.tags
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "hippo-booking-api-eb-instance-profile-${var.env_suffix}"

  role = aws_iam_role.eb_instance_role.name
}

resource "aws_iam_role" "eb_instance_role" {
  name = "eb-instance-role-${var.env_suffix}"

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier",
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkMulticontainerDocker",
    "arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier",
  ]

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      }
    }
  ]
}
EOF
}

output "elastic_beanstalk_application_name" {
  value = aws_elastic_beanstalk_application.hippo-booking-api.name
}

output "elastic_beanstalk_environment_name" {
  value = aws_elastic_beanstalk_environment.hippo-booking-api-env.name
}