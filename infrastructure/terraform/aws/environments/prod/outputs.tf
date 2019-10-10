output "api" {
  value = module.prod.api
}

output "client" {
  value = module.prod.client
}

output "rds_endpoint" {
  value = module.prod.rds_endpoint
}

output "pool_client_id" {
  value = module.prod.pool_client_id
}

output "pool_id" {
  value = module.prod.pool_id
}

output "cache_id" {
  value = module.prod.cache_id
}

output "www_cache_id_PROD_ONLY" {
  value = aws_cloudfront_distribution.s3_react_www_distribution.id
}