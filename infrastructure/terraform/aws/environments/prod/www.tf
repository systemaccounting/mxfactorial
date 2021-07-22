// prod only
locals {
  WWW_URI = "www.${local.CUSTOM_DOMAIN}"
}

data "aws_route53_zone" "default" {
  name = "${local.CUSTOM_DOMAIN}." // local in main.tf
}

resource "aws_s3_bucket" "www_mxfactorial_client" {
  bucket = "www-mxfactorial-client-prod"

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://${local.CUSTOM_DOMAIN}"
  }

  force_destroy = true
}

resource "aws_cloudfront_distribution" "www_s3_client_distribution" {
  comment = "prod www cache"

  aliases = [local.WWW_URI]

  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = aws_s3_bucket.www_mxfactorial_client.website_endpoint
    origin_id   = aws_s3_bucket.www_mxfactorial_client.id
  }

  enabled = true

  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = aws_s3_bucket.www_mxfactorial_client.id
    viewer_protocol_policy = "redirect-to-https"
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
    // https://github.com/terraform-providers/terraform-provider-aws/issues/2418#issuecomment-371192507
    acm_certificate_arn = data.terraform_remote_state.aws_init_prod.outputs.client_www_cert
    ssl_support_method  = "sni-only"
  }
}

resource "aws_route53_record" "www_client_fqdn" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = local.WWW_URI
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www_s3_client_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.www_s3_client_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_client_fqdn_ipv6" {
  zone_id = data.aws_route53_zone.default.zone_id
  name    = local.WWW_URI
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.www_s3_client_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.www_s3_client_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}
