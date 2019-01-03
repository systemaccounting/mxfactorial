# `aws_route53_record` fail to resolve attributes on count > 1 `aws_acm_certificate` with single `terraform apply`

# workaround:
# 1. `terraform apply -target aws_acm_certificate.client_cert -target aws_acm_certificate.api_cert`
# 2. `terraform apply`

terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "global-mxfactorial-tf-state"
    dynamodb_table = "global-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "global-mxfactorial.tfstate"
  }
}

// us-east-1 required for Amazon Certificate Manager (acm)
provider "aws" {
  region = "us-east-1"
}

// variables and outputs consolidated here for convenient management of their dependency
// ATTN: addition to environment list requires addition to client_cert_map AND api_cert_map outputs

variable "environments" {
  type = "list"

  default = [
    "prod",
    "qa",
  ]
}

output "client_cert_map" {
  value = {
    prod = "${aws_acm_certificate_validation.client_cert.*.certificate_arn[0]}"
    qa   = "${aws_acm_certificate_validation.client_cert.*.certificate_arn[1]}"
  }
}

output "api_cert_map" {
  value = {
    prod = "${aws_acm_certificate_validation.api_cert.*.certificate_arn[0]}"
    qa   = "${aws_acm_certificate_validation.api_cert.*.certificate_arn[1]}"
  }
}

// prod only
output "client_www_cert" {
  value = "${aws_acm_certificate_validation.client_www_cert.certificate_arn}"
}
