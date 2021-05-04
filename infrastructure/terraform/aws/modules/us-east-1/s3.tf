resource "aws_s3_bucket" "artifacts" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  # force_destroy = true
}
