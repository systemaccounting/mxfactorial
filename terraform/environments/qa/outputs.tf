output "api" {
  value = "${module.qa.api}"
}

output "client" {
  value = "${module.qa.client}"
}

output "rds_endpoint" {
  value = "${module.qa.rds_endpoint}"
}

output "pool_client_id" {
  value = "${module.qa.pool_client_id}"
}

output "pool_id" {
  value = "${module.qa.pool_id}"
}

output "cache_id" {
  value = "${module.qa.cache_id}"
}
