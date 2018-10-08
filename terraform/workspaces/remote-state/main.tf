# prior art: https://stackoverflow.com/a/48362341

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "prod-mxfactorial-s3-tf-state" {
  bucket = "prod-mxfactorial-tf-state"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_dynamodb_table" "prod-mxfactorial-db-tf-state" {
  name           = "prod-mxfactorial-tf-state"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
