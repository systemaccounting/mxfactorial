resource "aws_cloudfront_distribution" "s3_react_distribution" {
  comment = "${var.environment} domain cache"

  origin {
    domain_name = "${var.s3_origin_domain_name}"
    origin_id   = "${var.s3_origin_id}"
  }

  enabled         = true
  aliases         = ["${var.domain_aliases}"]
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = "${var.s3_origin_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
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

  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    //https://github.com/terraform-providers/terraform-provider-aws/issues/2418#issuecomment-371192507
    acm_certificate_arn = "${var.ssl_arn}"
    ssl_support_method  = "sni-only"
  }
}
