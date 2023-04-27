locals {
  PROJECT_CONF          = yamldecode(file("../../../../../project.yaml"))
  STORAGE_ENV_VAR       = local.PROJECT_CONF.infrastructure.terraform.aws.modules.project-storage.env_var.set
  DDB_TABLE_NAME_PREFIX = local.STORAGE_ENV_VAR.DDB_TABLE_NAME_PREFIX.default
  DDB_TABLE_HASH_KEY    = local.STORAGE_ENV_VAR.DDB_TABLE_HASH_KEY.default
}

// avoids dependency on github workflow job outputs when sharing values
resource "aws_dynamodb_table" "github_workflows" {
  name         = "${local.DDB_TABLE_NAME_PREFIX}-${local.ID_ENV}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = local.DDB_TABLE_HASH_KEY

  attribute {
    name = local.DDB_TABLE_HASH_KEY
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
