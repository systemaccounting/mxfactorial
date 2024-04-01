locals {
  ID_ENV                = "${var.env_id}-${var.env}"
  PROJECT_CONF          = "project.yaml"
  CONF_FILE             = yamldecode(file("../../../../../${local.PROJECT_CONF}"))
  STORAGE_ENV_VAR       = local.CONF_FILE.infrastructure.terraform.aws.modules.project-storage.env_var.set
  DDB_TABLE_NAME_PREFIX = local.STORAGE_ENV_VAR.DDB_TABLE_NAME_PREFIX.default
  DDB_TABLE_HASH_KEY    = local.STORAGE_ENV_VAR.DDB_TABLE_HASH_KEY.default
  GO_MIGRATE            = "go-migrate"
}

// fails if services are not found in project.yaml
resource "terraform_data" "locals_test" {
  lifecycle {
    precondition {
      condition     = lookup(local.CONF_FILE.migrations, local.GO_MIGRATE, null) != null
      error_message = "${local.GO_MIGRATE} not found in ${local.PROJECT_CONF}"
    }
  }
}
