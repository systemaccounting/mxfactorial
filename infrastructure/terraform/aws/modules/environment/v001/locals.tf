locals {
  ID_ENV                  = "${var.env_id}-${var.env}"
  TITLED_ID_ENV           = replace(title(local.ID_ENV), "-", "")
  SPACED_ID_ENV           = replace(local.ID_ENV, "-", " ")
  PROJECT_JSON            = jsondecode(file("${path.module}/../../../../../../project.json"))
  GO_MIGRATE_LAYER_SUFFIX = local.PROJECT_JSON.apps.go-migrate.terraform.aws.layer_name_suffix
}
