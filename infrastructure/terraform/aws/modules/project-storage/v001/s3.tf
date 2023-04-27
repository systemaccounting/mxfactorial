resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.artifacts_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = true
}

resource "aws_s3_bucket" "tfstate" {
  bucket        = "${var.tfstate_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_tfstate
}

resource "aws_s3_bucket" "client_origin" {
  bucket = "${var.client_origin_bucket_name_prefix}-${local.ID_ENV}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "client_origin" {
  bucket = aws_s3_bucket.client_origin.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}