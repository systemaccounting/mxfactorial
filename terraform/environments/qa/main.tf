terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt = true
    bucket  = "qa-mxfactorial-tf-state"

    // CHANGE ENVIRONMENT HERE
    dynamodb_table = "qa-mxfactorial-tf-state"
    region         = "us-east-1"

    // CHANGE ENVIRONMENT HERE
    key = "qa-mxfactorial.tfstate"
  }
}

# tear down without output errors
# TF_WARN_OUTPUT_ERRORS=1 terraform destroy --auto-approve

provider "aws" {
  region = "us-east-1"

  # user regions where only cloud9 available
  # https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/
}

data "terraform_remote_state" "global" {
  backend = "s3"

  config {
    bucket = "global-mxfactorial-tf-state"
    key    = "global-mxfactorial.tfstate"
    region = "us-east-1"
  }
}

# IMPORTANT: first build lambda artifacts using `sh services/build.sh`
module "qa" {
  source = "../../modules/environment"

  ############### Shared ###############
  environment = "${var.environment}"

  ############### Shared in Lambda and RDS ###############
  db_master_username = "${var.db_master_username}"
  db_master_password = "${var.db_master_password}"

  ############### API Gateway ###############
  certificate_arn = "${lookup(data.terraform_remote_state.global.api_cert_map, var.environment)}"

  ############### Cloudfront ###############
  ssl_arn = "${lookup(data.terraform_remote_state.global.client_cert_map, var.environment)}"
}
