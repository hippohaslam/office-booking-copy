resource "aws_db_instance" "hippo-booking-db" {
  identifier           = "hippo-booking-db"
  allocated_storage    = 20 # Minimum storage for RDS instances
  engine               = "sqlserver-ex"
  engine_version       = "15.00.4073.23.v1"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = "password123" # Use a more secure password
  parameter_group_name = "default.sqlserver-ex-15.0"
  publicly_accessible  = true
  skip_final_snapshot  = true

  db_subnet_group_name   = aws_db_subnet_group.db-subnet.name
  vpc_security_group_ids = [aws_security_group.db-security-group.id]

  tags = local.tags
}

resource "aws_db_subnet_group" "db-subnet" {
  name       = "booking-db-subnet"
  subnet_ids = [aws_subnet.hippo-booking-subnet-db-a.id, aws_subnet.hippo-booking-subnet-db-b.id, aws_subnet.hippo-booking-subnet-db-c.id]

  tags = local.tags
}

resource "aws_subnet" "hippo-booking-subnet-db-a" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-west-1a"
}
resource "aws_route_table_association" "hippo-booking-subnet-db-a-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-a.id
  route_table_id = aws_route_table.route_table.id
}

resource "aws_subnet" "hippo-booking-subnet-db-b" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-west-1b"
}
resource "aws_route_table_association" "hippo-booking-subnet-db-b-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-b.id
  route_table_id = aws_route_table.route_table.id
}

resource "aws_subnet" "hippo-booking-subnet-db-c" {
  vpc_id            = aws_vpc.hippo-booking-vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "eu-west-1c"
}
resource "aws_route_table_association" "hippo-booking-subnet-c-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-db-c.id
  route_table_id = aws_route_table.route_table.id
}

resource "aws_security_group" "db-security-group" {
  name        = "booking-db-sg"
  description = "Allow database traffic"

  vpc_id = aws_vpc.hippo-booking-vpc.id

  tags = local.tags
}

resource "aws_vpc_security_group_ingress_rule" "allow_tls_ipv4" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv4         = aws_vpc.hippo-booking-vpc.cidr_block
  from_port         = 1433
  ip_protocol       = "tcp"
  to_port           = 1433
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


########## Only for development ##########

resource "aws_vpc_security_group_ingress_rule" "allow_all_ipv4_inbound" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 1433
  ip_protocol       = "tcp"
  to_port           = 1433
}

resource "aws_vpc_security_group_ingress_rule" "allow_all_ipv6_inbound" {
  security_group_id = aws_security_group.db-security-group.id
  cidr_ipv6         = "::/0"
  from_port         = 1433
  ip_protocol       = "tcp"
  to_port           = 1433
}