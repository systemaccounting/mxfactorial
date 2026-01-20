resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.artifacts_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_storage
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_notification" "artifacts_eventbridge" {
  bucket      = aws_s3_bucket.artifacts.id
  eventbridge = true
}

resource "aws_s3_bucket" "tfstate" {
  bucket        = "${var.tfstate_bucket_name_prefix}-${local.ID_ENV}"
  force_destroy = var.force_destroy_storage
}