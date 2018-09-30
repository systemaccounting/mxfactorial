terraform {
  required_version = ">= 0.11.8"

  backend "s3" {
    encrypt        = true
    bucket         = "prod-mxfactorial-tf-state"
    dynamodb_table = "prod-mxfactorial-tf-state"
    region         = "us-east-1"
    key            = "prod-mxfactorial.tfstate"
  }
}
