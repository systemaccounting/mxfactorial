output "rds_endpoint" {
  value = "${module.rds.rds_endpoint}"
}

output "pool_id" {
  value = "${module.cognito.pool_id}"
}

output "pool_client_id" {
  value = "${module.cognito.pool_client_id}"
}

output "api" {
  value = "${module.dns.api}"
}

output "client" {
  value = "${module.dns.client}"
}

output "cache_id" {
  value = "${module.cloudfront.cache_id}"
}
