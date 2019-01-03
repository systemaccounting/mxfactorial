# prior art: https://stackoverflow.com/a/48362341

provider "aws" {
  region = "us-east-1"
}

variable "environments" {
  type = "list"

  default = [
    "global",
    "prod",
    "qa",
  ]
}

resource "aws_s3_bucket" "global-mxfactorial-s3-tf-state" {
  bucket = "global-mxfactorial-tf-state"

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }

  # force_destroy = true
}

resource "aws_dynamodb_table" "tf-state" {
  count          = "${length(var.environments)}"
  name           = "${element(var.environments, count.index)}-mxfactorial-tf-state"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
