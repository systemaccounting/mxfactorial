output "api" {
  value = "${module.dev.api}"
}

output "client" {
  value = "${module.dev.client}"
}

output "rds_endpoint" {
  value = "${module.dev.rds_endpoint}"
}

output "pool_client_id" {
  value = "${module.dev.pool_client_id}"
}

output "pool_id" {
  value = "${module.dev.pool_id}"
}

output "cache_id" {
  value = "${module.dev.cache_id}"
}
