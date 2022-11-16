// bucket provisioned in infrastructure/terraform/aws/environments/init-env

resource "random_password" "referer" {
  length  = 24
  special = true
}

resource "aws_s3_bucket_policy" "client_origin" {
  bucket = var.client_origin_bucket_name
  policy = jsonencode({
    Id = "CloudFrontGetBucketObjects${local.TITLED_ID_ENV}"
    Statement = [
      {
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
        ]
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Resource = "arn:aws:s3:::${var.client_origin_bucket_name}/*"
        Sid      = "AllowCloudFrontGetS3Object${local.TITLED_ID_ENV}"
        Condition = {
          StringLike = {
            "aws:Referer" : random_password.referer.result
          }
        }
      }
    ]
    Version = "2012-10-17"
  })
}
