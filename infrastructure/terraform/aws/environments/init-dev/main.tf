terraform {
  required_version = "~> 0.15.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-init-dev" // !!! change value when duplicating !!!
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
