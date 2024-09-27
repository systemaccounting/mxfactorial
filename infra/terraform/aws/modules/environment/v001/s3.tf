// bucket provisioned in infra/terraform/aws/environments/init-env

resource "random_password" "referer" {
  length  = 24
  special = true
}

resource "aws_s3_bucket_policy" "client_origin" {
  bucket = var.client_origin_bucket_name
  policy = data.aws_iam_policy_document.client_origin.json
}

data "aws_iam_policy_document" "client_origin" {

  policy_id = "CloudFrontGetBucketObjects${local.TITLED_ID_ENV}"

  statement {

    sid = "AllowCloudFrontGetS3Object${local.TITLED_ID_ENV}"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
    ]

    resources = [
      "arn:aws:s3:::${var.client_origin_bucket_name}/*"
    ]

    dynamic "condition" {

      # https://stackoverflow.com/a/70594607
      for_each = var.build_cache ? [1] : []

      content {
        test     = "StringLike"
        variable = "aws:Referer"
        values   = [random_password.referer.result]
      }

    }
  }
}
