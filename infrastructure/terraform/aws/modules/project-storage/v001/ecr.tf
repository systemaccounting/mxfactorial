module "ecr_repos" {
  for_each                = local.ECR_REPOS
  source                  = "../../ecr/v001"
  max_image_storage_count = var.max_image_storage_count
  env                     = var.env
  env_id                  = var.env_id
  service_name            = each.value
}
