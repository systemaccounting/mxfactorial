terraform {
  required_version = "~> 0.15.0"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-us-east-1" // !!! change value when duplicating !!!
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
