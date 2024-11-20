locals {
  db_subnet_routing_table_id = var.enable_db_public_access ? aws_route_table.public_route_table.id : aws_route_table.private_route_table.id
}

resource "aws_db_instance" "hippo-booking-db" {
  identifier              = "hippo-booking-db-${var.env_suffix}"
  allocated_storage       = 20 # Minimum storage for RDS instances
  engine                  = "postgres"
  engine_version          = "16.3"
  instance_class          = var.db_instance_size
  username                = "postgres"
  password                = random_password.db_password.result
  parameter_group_name    = "default.postgres16"
  publicly_accessible     = var.enable_db_public_access
  skip_final_snapshot     = true
  backup_retention_period = var.db_retention_period
  storage_encrypted       = true

  db_subnet_group_name   = aws_db_subnet_group.db-subnet.name
  vpc_security_group_ids = [aws_security_group.db-security-group.id]
}

resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "_%"
}

resource "aws_db_subnet_group" "db-subnet" {
  name       = "booking-db-subnet-group-${var.env_suffix}"
  subnet_ids = [aws_subnet.hippo-booking-subnet-db-a.id, aws_subnet.hippo-booking-subnet-db-b.id, aws_subnet.hippo-booking-subnet-db-c.id]
}

resource "aws_subnet" "hippo-booking-subnet-db-a" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"
}
resource "aws_route_table_association" "hippo-booking-subnet-db-a-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-a.id
  route_table_id = local.db_subnet_routing_table_id
}

resource "aws_subnet" "hippo-booking-subnet-db-b" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-west-1b"
}
resource "aws_route_table_association" "hippo-booking-subnet-db-b-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-b.id
  route_table_id = local.db_subnet_routing_table_id
}

resource "aws_subnet" "hippo-booking-subnet-db-c" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "eu-west-1c"
}
resource "aws_route_table_association" "hippo-booking-subnet-c-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-c.id
  route_table_id = local.db_subnet_routing_table_id
}

resource "aws_security_group" "db-security-group" {
  name        = "booking-db-sg"
  description = "Allow database traffic"

  vpc_id = aws_vpc.hippo-booking-vpc.id
}

resource "aws_vpc_security_group_ingress_rule" "allow_tls_ipv4" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv4         = aws_vpc.hippo-booking-vpc.cidr_block
  from_port         = 5432
  ip_protocol       = "tcp"
  to_port           = 5432
  description       = "Internal traffic in VPC"
}

resource "aws_vpc_security_group_ingress_rule" "allow_hippo_office_ipv4" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv4         = "195.224.212.222/32"
  from_port         = 5432
  ip_protocol       = "tcp"
  to_port           = 5432
  description       = "Leeds Hippo Office"
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}

resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv6" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv6         = "::/0"
  ip_protocol       = "-1" # semantically equivalent to all ports
}