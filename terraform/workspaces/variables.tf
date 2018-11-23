variable "region" {
  type = "map"

  default = {
    prod = "us-east-1"
    dev  = "us-east-2"
  }
}

variable "admin_email" {
  type = "string"
}

//var.environments in ../global/variables.tf
resource "null_resource" "client_cert_arns" {
  triggers = {
    prod = "${data.terraform_remote_state.global.client_certs[0]}"
    dev  = "${data.terraform_remote_state.global.client_certs[1]}"
  }
}

resource "null_resource" "api_cert_arns" {
  triggers = {
    prod = "${data.terraform_remote_state.global.api_certs[0]}"
    dev  = "${data.terraform_remote_state.global.api_certs[1]}"
  }
}

data "terraform_remote_state" "global" {
  backend = "s3"

  config {
    bucket = "global-mxfactorial-tf-state"
    key    = "global-mxfactorial.tfstate"
    region = "us-east-1"
  }
}
