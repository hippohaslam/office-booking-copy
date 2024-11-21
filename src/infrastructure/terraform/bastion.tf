#https://towardsaws.com/creating-a-bastion-host-for-secure-access-to-your-aws-infrastructure-with-terraform-17ee287bb3d

resource "aws_security_group" "ec2-bastion-sg" {
  description = "EC2 Bastion Host Security Group"
  name        = "hippo-booking-ec2-bastion-sg-${var.env_suffix}"
  vpc_id      = aws_vpc.hippo-booking-vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["195.224.212.222/32"]
    description = "Leeds Hippo Office"
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    ipv6_cidr_blocks = ["::/0"]
    description      = "IPv6 route Open to Public Internet"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "IPv4 route Open to Public Internet"
  }
}

resource "aws_eip" "bastion-host-eip" {
  tags = {
    Name = "hippo-booking-bastion-eip-${var.env_suffix}"
  }
}

resource "aws_subnet" "hippo-booking-subnet-bastion" {
  vpc_id     = aws_vpc.hippo-booking-vpc.id
  cidr_block = "10.0.6.0/24"
}
resource "aws_route_table_association" "hippo-booking-subnet-bastion-routing" {
  subnet_id      = aws_subnet.hippo-booking-subnet-bastion.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_instance" "ec2-bastion-host" {
  ami                         = "ami-0d64bb532e0502c46"
  instance_type               = "t2.nano"
  vpc_security_group_ids      = [aws_security_group.ec2-bastion-sg.id]
  subnet_id                   = aws_subnet.hippo-booking-subnet-bastion.id
  associate_public_ip_address = false
  root_block_device {
    volume_size           = 8
    delete_on_termination = true
    volume_type           = "gp2"
    encrypted             = true
    tags = {
      Name = "hippo-booking-bastion-root-volume-${var.env_suffix}"
    }
  }
  credit_specification {
    cpu_credits = "standard"
  }
  tags = {
    Name = "hippo-booking-bastion-${var.env_suffix}"
  }
  lifecycle {
    ignore_changes = [
      associate_public_ip_address,
    ]
  }
}

resource "aws_eip_association" "ec2-bastion-host-eip-association" {
  instance_id   = aws_instance.ec2-bastion-host.id
  allocation_id = aws_eip.bastion-host-eip.id
}
