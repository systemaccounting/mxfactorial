output "cloudfront_domain_name" {
  value = "${aws_api_gateway_domain_name.mxfactorial.cloudfront_domain_name}"
}

output "cloudfront_zone_id" {
  value = "${aws_api_gateway_domain_name.mxfactorial.cloudfront_zone_id}"
}
