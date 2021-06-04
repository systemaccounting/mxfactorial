// bucket provisioned in infrastructure/terraform/aws/environments/us-east-1

resource "aws_s3_bucket_policy" "mxfactorial_client" {
  bucket = var.client_origin_bucket_name
  policy = data.aws_iam_policy_document.mxfactorial_client.json
}

data "aws_iam_policy_document" "mxfactorial_client" {
  version = "2012-10-17"

  statement {
    sid = "CloudFrontGetBucketObjects${title(var.env)}"
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.s3_client_distribution.iam_arn]
    }
    actions   = ["s3:GetObject"]
    resources = ["arn:aws:s3:::${var.client_origin_bucket_name}/*"]
  }

  statement {
    sid       = "CloudFrontListBucketObjects${title(var.env)}"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.client_origin_bucket_name}"]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.s3_client_distribution.iam_arn]
    }
  }
}
