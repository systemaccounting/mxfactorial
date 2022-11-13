terraform {
  required_version = "~> 1.2.7"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "aws-init-prod" // !!! change value when duplicating !!!
    }
  }
}

provider "aws" {
  region = "us-east-1"
}
