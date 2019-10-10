resource "aws_s3_bucket" "artifacts" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  # force_destroy = true
}

resource "aws_s3_bucket" "websocket-artifacts" {
  bucket = "mxfactorial-websocket-artifacts-${var.environment}"
  # force_destroy = true
}
