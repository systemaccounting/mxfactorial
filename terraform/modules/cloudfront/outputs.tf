output "cache_id" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.id}"
}

output "s3_react_distribution_domain_name" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.domain_name}"
}

output "s3_react_distribution_hosted_zone_id" {
  value = "${aws_cloudfront_distribution.s3_react_distribution.hosted_zone_id}"
}
