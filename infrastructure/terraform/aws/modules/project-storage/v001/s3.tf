resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.artifacts_bucket_name_prefix}-${var.env_id}-${var.env}"
  force_destroy = true
}

resource "aws_s3_bucket" "tfstate" {
  bucket        = "${var.tfstate_bucket_name_prefix}-${var.env_id}-${var.env}"
  force_destroy = var.force_destroy_tfstate
}

resource "aws_s3_bucket" "client_origin" {
  bucket = "${var.client_origin_bucket_name_prefix}-${var.env_id}-${var.env}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}
