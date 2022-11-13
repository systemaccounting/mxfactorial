locals {
  PROJECT_JSON          = jsondecode(file("../../../../../project.json"))
  DDB_TABLE_NAME_PREFIX = local.PROJECT_JSON.github_workflows.dynamodb_table.name_prefix
  DDB_TABLE_HASH_KEY    = local.PROJECT_JSON.github_workflows.dynamodb_table.hash_key
}

// avoids dependency on github workflow job outputs when sharing values
resource "aws_dynamodb_table" "github_workflows" {
  name         = "${var.ddb_table_name_prefix}-${var.env_id}-${var.env}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = var.ddb_table_hash_key

  attribute {
    name = var.ddb_table_hash_key
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
