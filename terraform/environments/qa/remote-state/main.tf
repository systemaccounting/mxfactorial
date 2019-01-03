provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "qa-mxfactorial-s3-tf-state" {
  bucket = "qa-mxfactorial-tf-state"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  # force_destroy = true
}

resource "aws_dynamodb_table" "tf-state" {
  name           = "qa-mxfactorial-tf-state"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
