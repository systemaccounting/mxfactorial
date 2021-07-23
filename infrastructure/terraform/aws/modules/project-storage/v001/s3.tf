resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.artifacts_bucket_name_prefix}-${var.env}"
  force_destroy = true
}

resource "aws_s3_bucket" "client_origin" {
  bucket = "${var.client_origin_bucket_name_prefix}-${var.env}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}
