####### vpc endpoint for api service access by lambda in vpc #######
resource "aws_vpc_endpoint" "api" {
  vpc_id = data.aws_vpc.default.id

  # aws ec2 describe-vpc-endpoint-services
  service_name      = "com.amazonaws.us-east-1.execute-api"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.vpce_api.id,
  ]

  subnet_ids          = tolist(data.aws_subnet_ids.default.ids)
  private_dns_enabled = true
}

####### security group for vpce and dependent resources #######
resource "aws_security_group" "vpce_api" {
  name        = "vpce-api"
  description = "allow all traffic between api dependent resources"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  # ingress {
  #   from_port   = 0
  #   to_port     = 0
  #   protocol    = "-1"
  #   cidr_blocks = ["/32"]
  # }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }
  tags = {
    name = "vpce-api"
  }
}
