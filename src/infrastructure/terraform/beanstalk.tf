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
  route_table_id = aws_route_table.public_route_table.id
}
resource "aws_route_table_association" "hippo-booking-api-subnet-b-routing" {
  subnet_id      = aws_subnet.hippo-booking-api-subnet-b.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_security_group" "beanstalk_sg" {
  name        = "beanstalk-sg-${var.env_suffix}"
  description = "Security group for Elastic Beanstalk"
  vpc_id      = aws_vpc.hippo-booking-vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["10.0.0.0/16"]
  }
}

resource "aws_elastic_beanstalk_environment" "hippo-booking-api-env" {
  name                = local.beanstalk-api-name
  application         = aws_elastic_beanstalk_application.hippo-booking-api.name
  solution_stack_name = "64bit Amazon Linux 2023 v3.1.3 running .NET 8"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.beanstalk_instance_type
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
    resource  = ""
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
    value     = var.environment
    resource  = ""
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "IsAwsEnvironment"
    value     = true
    resource  = ""
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AllowedOrigins"
    value     = "https://${var.frontend_subdomain}.${var.hosted_zone_url}"
    resource  = ""
  }
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
    aws_iam_policy.secrets_manager_policy.arn,
    aws_iam_policy.cloudwatch_policy.arn
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

resource "aws_iam_policy" "secrets_manager_policy" {
  name        = "BookingELBAccessSecretsManagerPolicy_${var.env_suffix}"
  description = "Policy to allow ELB to access specific secrets in AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:GetSecretValue"
        ],
        Resource = aws_secretsmanager_secret.dotnet_secrets.arn
      }
    ]
  })
}

resource "aws_iam_policy" "cloudwatch_policy" {
  name        = "BookingELBAccessCloudwatchPolicy_${var.env_suffix}"
  description = "Policy to allow ELB to access to cloudwatch"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ],
        Resource = ["*"]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_secrets_policy" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = aws_iam_policy.secrets_manager_policy.arn
}
resource "aws_iam_role_policy_attachment" "attach_cloudwatch_policy" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = aws_iam_policy.cloudwatch_policy.arn
}

output "elastic_beanstalk_application_name" {
  value = aws_elastic_beanstalk_application.hippo-booking-api.name
}

output "elastic_beanstalk_environment_name" {
  value = aws_elastic_beanstalk_environment.hippo-booking-api-env.name
}