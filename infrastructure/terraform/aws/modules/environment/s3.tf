resource "aws_s3_bucket" "mxfactorial_react" {
  bucket = "mxfactorial-react-${var.environment}"

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}

resource "aws_s3_bucket_policy" "mxfactorial_react" {
  bucket = aws_s3_bucket.mxfactorial_react.id
  policy = data.aws_iam_policy_document.mxfactorial_react.json
}

data "aws_iam_policy_document" "mxfactorial_react" {
  version = "2012-10-17"

  statement {
    sid = "CloudFrontGetBucketObjects${title(var.environment)}"
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.s3_react_distribution.iam_arn]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.mxfactorial_react.arn}/*"]
  }

  statement {
    sid       = "CloudFrontListBucketObjects${title(var.environment)}"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.mxfactorial_react.arn]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.s3_react_distribution.iam_arn]
    }
  }
}
