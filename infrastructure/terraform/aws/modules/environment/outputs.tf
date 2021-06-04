output "s3_client_distribution_domain_name" {
  value = "${var.client_origin_bucket_name}.s3.amazonaws.com"
}
