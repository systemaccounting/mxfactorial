locals {
  ID_ENV                  = "${var.env_id}-${var.env}"
  TITLED_ID_ENV           = replace(title(local.ID_ENV), "-", "")
  SPACED_ID_ENV           = replace(local.ID_ENV, "-", " ")
  PROJECT_CONF            = yamldecode(file("${path.module}/../../../../../../project.yaml"))
  GO_MIGRATE_LAYER_PREFIX = local.PROJECT_CONF.infrastructure.terraform.aws.modules.environment.env_var.set.GO_MIGRATE_LAYER_PREFIX.default
}
