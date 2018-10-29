resource "aws_cloudfront_distribution" "s3_react_distribution" {
  comment = "${lookup(var.environment, "${terraform.workspace}")} naked cache"

  origin {
    domain_name = "${aws_s3_bucket.mxfactorial-react.bucket_regional_domain_name}"
    origin_id   = "${aws_s3_bucket.mxfactorial-react.id}"
  }

  enabled = true

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
