resource "aws_cloudfront_distribution" "s3_client_distribution" {
  comment = "${var.env} domain cache"

  origin {
    domain_name = "${var.client_origin_bucket_name}.s3-website-${data.aws_region.current.name}.amazonaws.com"
    origin_id   = var.client_origin_bucket_name

    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    custom_header {
      name = "Referer"
      value = random_password.referer.result
    }
  }

  enabled         = true
  aliases         = var.custom_domain_name == "" ? null : [
    var.env == "prod" ? var.custom_domain_name : "${var.env}.${var.custom_domain_name}"
  ]
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = var.client_origin_bucket_name
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
    acm_certificate_arn = var.custom_domain_name == "" ? null : var.client_cert_arn
    ssl_support_method  = var.custom_domain_name == "" ? null : "sni-only"

    // use default if custom_domain_name not used
    cloudfront_default_certificate = var.custom_domain_name == "" ? true : null
  }
}