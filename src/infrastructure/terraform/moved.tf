moved {
  from = aws_security_group.ec2-bastion-sg
  to   = module.bastion[0].aws_security_group.ec2-bastion-sg
}

moved {
  from = aws_subnet.hippo-booking-subnet-bastion
  to   = module.bastion[0].aws_subnet.hippo-booking-subnet-bastion
}

moved {
  from = aws_route_table_association.hippo-booking-subnet-bastion-routing
  to   = module.bastion[0].aws_route_table_association.hippo-booking-subnet-bastion-routing
}

moved {
  from = aws_instance.ec2-bastion-host
  to   = module.bastion[0].aws_instance.ec2-bastion-host
}

moved {
  from = aws_eip_association.ec2-bastion-host-eip-association
  to   = module.bastion[0].aws_eip_association.ec2-bastion-host-eip-association
}

moved {
  from = aws_eip.bastion-host-eip
  to   = module.bastion[0].aws_eip.bastion-host-eip
}