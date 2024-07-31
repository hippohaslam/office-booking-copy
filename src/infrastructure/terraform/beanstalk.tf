resource "aws_elastic_beanstalk_application" "hippo-booking-api" {
  name        = "hippo-booking-api"
  description = "Elastic Beanstalk application for .NET API"
}

resource "aws_subnet" "hippo-booking-api-subnet-a" {
  vpc_id     = aws_vpc.hippo-booking-vpc.id
  cidr_block = "10.0.4.0/24"
}

resource "aws_subnet" "hippo-booking-api-subnet-b" {
  vpc_id     = aws_vpc.hippo-booking-vpc.id
  cidr_block = "10.0.5.0/24"
}
resource "aws_route_table_association" "hippo-booking-api-subnet-a-routing" {
  subnet_id      = aws_subnet.hippo-booking-api-subnet-a.id
  route_table_id = aws_route_table.route_table.id
}
resource "aws_route_table_association" "hippo-booking-api-subnet-b-routing" {
  subnet_id      = aws_subnet.hippo-booking-api-subnet-b.id
  route_table_id = aws_route_table.route_table.id
}

resource "aws_elastic_beanstalk_environment" "hippo-booking-api-env" {
  name                = "hippo-booking-api-env"
  application         = aws_elastic_beanstalk_application.hippo-booking-api.name
  solution_stack_name = "64bit Amazon Linux 2023 v3.1.3 running .NET 8"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MinSize"
    value     = "1"
  }

  setting {
    namespace = "aws:autoscaling:asg"
    name      = "MaxSize"
    value     = "1"
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = aws_vpc.hippo-booking-vpc.id
  }

  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", [aws_subnet.hippo-booking-api-subnet-a.id, aws_subnet.hippo-booking-api-subnet-b.id])
  }
  #
  #  setting {
  #    namespace = "aws:elasticbeanstalk:environment:process:default"
  #    name      = "Port"
  #    value     = "80"
  #  }
  #
  #  setting {
  #    namespace = "aws:elasticbeanstalk:environment:process:default"
  #    name      = "Protocol"
  #    value     = "HTTP"
  #  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ASPNETCORE_ENVIRONMENT"
    value     = "Test"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ConnectionStrings__HippoBookingDbContext"
    value     = "Server=${aws_db_instance.hippo-booking-db.address};Database=HippoBooking_Test;User Id=${aws_db_instance.hippo-booking-db.username};Password=${aws_db_instance.hippo-booking-db.password};TrustServerCertificate=True"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Aws__AccessKeyId"
    value     = var.aws_access_key_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Aws__AccessSecretKey"
    value     = var.aws_secret_access_key
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Google__ClientId"
    value     = var.google_client_id
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "Google__ClientSecret"
    value     = var.google_client_secret
  }

  tags = local.tags
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "hippo-booking-api-eb-instance-profile"

  role = aws_iam_role.eb_instance_role.name
}

resource "aws_iam_role" "eb_instance_role" {
  name = "eb-instance-role"

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