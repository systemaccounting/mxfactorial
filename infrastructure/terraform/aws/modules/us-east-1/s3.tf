resource "aws_s3_bucket" "artifacts" {
  bucket        = "mxfactorial-artifacts-${var.env}"
  force_destroy = true
}

resource "aws_s3_bucket" "client_origin" {
  bucket = "mxfactorial-client-${var.env}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}
