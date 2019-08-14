data "aws_route53_zone" "mxfactorial_io" {
  name = "mxfactorial.io."
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet_ids" "default" {
  vpc_id = data.aws_vpc.default.id
}

data "aws_security_group" "default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

data "aws_route_table" "default" {
  vpc_id = data.aws_vpc.default.id

  filter {
    name   = "association.main"
    values = ["true"]
  }
}

data "aws_security_group" "vpce_api" {
  vpc_id = data.aws_vpc.default.id
  name   = "vpce-api"
}

data "aws_region" "current" {}

data "aws_vpc_endpoint" "private-api" {
  vpc_id       = data.aws_vpc.default.id
  service_name = "com.amazonaws.${data.aws_region.current.name}.execute-api"
}
