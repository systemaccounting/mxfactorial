####### vpc endpoint for api service access by lambda in vpc #######
resource "aws_vpc_endpoint" "api" {
  vpc_id = data.aws_vpc.default.id

  # aws ec2 describe-vpc-endpoint-services
  service_name      = "com.amazonaws.us-east-1.execute-api"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.vpce.id,
  ]

  subnet_ids          = tolist(data.aws_subnet_ids.default.ids)
  private_dns_enabled = true
}

####### vpc endpoint for sns service access by lambda in vpc #######
resource "aws_vpc_endpoint" "sns" {
  vpc_id = data.aws_vpc.default.id

  # aws ec2 describe-vpc-endpoint-services
  service_name      = "com.amazonaws.us-east-1.sns"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    aws_security_group.vpce.id,
  ]

  subnet_ids          = tolist(data.aws_subnet_ids.default.ids)
  private_dns_enabled = true
}

####### vpc endpoint for dynamodb access by lambda in vpc #######
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id       = data.aws_vpc.default.id
  service_name = "com.amazonaws.us-east-1.dynamodb"
}

resource "aws_vpc_endpoint_route_table_association" "dynamodb" {
  vpc_endpoint_id = aws_vpc_endpoint.dynamodb.id
  route_table_id  = data.aws_vpc.default.main_route_table_id
}

####### security group for vpce and dependent resources #######
resource "aws_security_group" "vpce" {
  name        = "vpce"
  description = "allow all traffic between vpce dependent resources"
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
    name = "vpce"
  }
}

