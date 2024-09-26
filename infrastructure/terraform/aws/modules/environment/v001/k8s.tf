module "microk8s" {
  count         = var.enable_microk8s ? 1 : 0
  source        = "../../microk8s/v001"
  env           = var.env
  env_id        = var.env_id
  ssm_prefix    = var.ssm_prefix
  instance_type = var.microk8s_instance_type
}
