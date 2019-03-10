terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "us-east-1-mxfactorial-tf-state"
    dynamodb_table = "us-east-1-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "us-east-1-mxfactorial.tfstate"
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "default" {
  vpc_id = "${data.aws_vpc.default.id}"
}

data "aws_region" "current" {}

####### vpc endpoint for sqs service access by lambda in vpc #######
resource "aws_vpc_endpoint" "sqs" {
  vpc_id = "${data.aws_vpc.default.id}"

  # aws ec2 describe-vpc-endpoint-services
  service_name      = "com.amazonaws.${data.aws_region.current.name}.sqs"
  vpc_endpoint_type = "Interface"

  security_group_ids = [
    "${aws_security_group.vpce_sqs.id}",
  ]

  subnet_ids          = ["${data.aws_subnet_ids.default.ids}"]
  private_dns_enabled = true
}

####### security group for vpce and dependent resources #######
resource "aws_security_group" "vpce_sqs" {
  name        = "vpce-sqs"
  description = "allow all traffic between sqs dependent resources"
  vpc_id      = "${data.aws_vpc.default.id}"

  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
  }

  tags {
    name = "vpce-sqs"
  }
}
