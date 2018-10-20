resource "aws_s3_bucket" "mxfactorial-react" {
  bucket = "mxfactorial-react"
  policy = "${file("s3-policy.json")}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket" "www-mxfactorial-react" {
  bucket = "www-mxfactorial-react"

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://${aws_s3_bucket.mxfactorial-react.id}"
  }
}
