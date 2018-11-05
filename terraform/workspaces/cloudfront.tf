resource "aws_cloudfront_distribution" "s3_react_distribution" {
  comment = "${lookup(var.environment, "${terraform.workspace}")} root domain cache"

  origin {
    domain_name = "${aws_s3_bucket.mxfactorial-react.bucket_regional_domain_name}"
    origin_id   = "${aws_s3_bucket.mxfactorial-react.id}"
  }

  enabled = true

  //add period at end of alias_prefix variable value instead of before root domain here
  # aliases = ["${lookup(var.alias_prefix, "${terraform.workspace}")}mxfactorial.io"]

  is_ipv6_enabled = true
  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = "${aws_s3_bucket.mxfactorial-react.id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

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
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_distribution" "s3_react_www_distribution" {
  comment = "${lookup(var.environment, "${terraform.workspace}")} www cache"

  //create www-prefix distribution for prod only
  count = "${lookup(var.environment, "${terraform.workspace}") == "prod" ?  1 : 0}"

  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = "${aws_s3_bucket.www-mxfactorial-react.website_endpoint}"
    origin_id   = "${aws_s3_bucket.www-mxfactorial-react.id}"
  }

  enabled = true

  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = "${aws_s3_bucket.www-mxfactorial-react.id}"
    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

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
    cloudfront_default_certificate = true
  }
}
