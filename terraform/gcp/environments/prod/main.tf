terraform {
  required_version = "~> 0.12.4"

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "systemaccounting"

    workspaces {
      name = "gcp-prod"
    }
  }
}

# location dependencies:
# functions: https://cloud.google.com/functions/docs/locations

provider "google" {
  # export GOOGLE_CLOUD_KEYFILE_JSON=~/key.json on local
  project = "prod-mxfactorial"
  region  = "us-west2"
  zone    = "us-west2-c"
  version = "~> 2.5"
}

module "prod" {
  source             = "../../modules/environment"
  environment        = "prod"
  db_master_username = var.db_master_username
  db_master_password = var.db_master_password
}
