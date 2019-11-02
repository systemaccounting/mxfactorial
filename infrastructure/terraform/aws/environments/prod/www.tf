# prod only
resource "aws_s3_bucket" "www_mxfactorial_react" {
  bucket = "www-mxfactorial-react-prod"

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://${module.prod.s3_react_distribution_domain_name}"
  }

  force_destroy = true
}

resource "aws_s3_bucket_policy" "www_mxfactorial_react" {
  bucket = aws_s3_bucket.www_mxfactorial_react.id
  policy = data.aws_iam_policy_document.www_mxfactorial_react.json
}

data "aws_iam_policy_document" "www_mxfactorial_react" {
  version = "2012-10-17"

  statement {
    sid = "CloudFrontGetWWWBucketObjects${title(var.environment)}"
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.www_s3_react_distribution.iam_arn]
    }
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.www_mxfactorial_react.arn}/*"]
  }

  statement {
    sid       = "CloudFrontListWWWBucketObjects${title(var.environment)}"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.www_mxfactorial_react.arn]
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.www_s3_react_distribution.iam_arn]
    }
  }
}

resource "aws_cloudfront_distribution" "www_s3_react_distribution" {
  comment = "prod www cache"

  aliases = ["www.mxfactorial.io"]

  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = aws_s3_bucket.www_mxfactorial_react.website_endpoint
    origin_id   = aws_s3_bucket.www_mxfactorial_react.id
  }

  enabled = true

  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = aws_s3_bucket.www_mxfactorial_react.id
    viewer_protocol_policy = "allow-all"
    min_ttl                = 0

    default_ttl = 3600
    max_ttl     = 86400

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    //https://github.com/terraform-providers/terraform-provider-aws/issues/2418#issuecomment-371192507
    acm_certificate_arn = data.terraform_remote_state.aws-us-east-1.outputs.client_www_cert
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_identity" "www_s3_react_distribution" {
  comment = "cloudfront origin access identity for www s3 access in prod"
}
