resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.artifacts_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_storage
}

resource "aws_s3_bucket" "tfstate" {
  bucket        = "${var.tfstate_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_storage
}

resource "aws_s3_bucket" "client_origin" {
  bucket        = "${var.client_origin_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_storage
}

resource "aws_s3_bucket_website_configuration" "client_origin" {
  bucket = aws_s3_bucket.client_origin.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_public_access_block" "client_origin" {
  bucket                  = aws_s3_bucket.client_origin.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
