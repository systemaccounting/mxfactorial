# prior art: https://stackoverflow.com/a/48362341

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "dev-mxfactorial-s3-tf-state" {
  bucket = "dev-mxfactorial-tf-state"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  # force_destroy = true
}

resource "aws_dynamodb_table" "tf-state" {
  name           = "dev-mxfactorial-tf-state"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
