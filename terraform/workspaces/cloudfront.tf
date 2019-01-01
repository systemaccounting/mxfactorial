resource "aws_cloudfront_distribution" "s3_react_distribution" {
  comment = "${terraform.workspace} domain cache"

  origin {
    domain_name = "${module.s3_react.react_bucket_regional_domain_name}"
    origin_id   = "${module.s3_react.react_bucket_id}"
  }

  enabled         = true
  aliases         = ["${"${terraform.workspace}" == "prod" ?  "mxfactorial.io" : "${terraform.workspace}.mxfactorial.io"}"]
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = "${module.s3_react.react_bucket_id}"
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
    acm_certificate_arn = "${lookup("${null_resource.client_cert_arns.triggers}", "${terraform.workspace}")}"
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "s3_react_www_distribution" {
  comment = "prod www cache"

  //create www-prefix distribution for prod only
  count = "${"${terraform.workspace}" == "prod" ?  1 : 0}"

  aliases = ["www.mxfactorial.io"]

  origin {
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
    }

    domain_name = "${aws_s3_bucket.www_mxfactorial_react.website_endpoint}"
    origin_id   = "${aws_s3_bucket.www_mxfactorial_react.id}"
  }

  enabled = true

  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods        = ["HEAD", "GET"]
    cached_methods         = ["HEAD", "GET"]
    target_origin_id       = "${aws_s3_bucket.www_mxfactorial_react.id}"
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
    acm_certificate_arn = "${data.terraform_remote_state.global.client_www_cert}"
    ssl_support_method  = "sni-only"
  }
}
