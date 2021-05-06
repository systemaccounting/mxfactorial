resource "aws_s3_bucket" "artifacts" {
  bucket = "mxfactorial-artifacts-${var.env}"
  # force_destroy = true
}

resource "aws_s3_bucket" "react_origin" {
  bucket = "mxfactorial-react-${var.env}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}
