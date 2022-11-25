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
