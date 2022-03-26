locals {
  PROJECT_JSON = "../../../../../project.json"
  DDB_TABLE_NAME_PREFIX = jsondecode(file(local.PROJECT_JSON)).github_workflows.dynamodb_table.name_prefix
  DDB_TABLE_HASH_KEY = jsondecode(file(local.PROJECT_JSON)).github_workflows.dynamodb_table.hash_key
}

// avoids dependency on github workflow job outputs when sharing values
resource "aws_dynamodb_table" "github_workflows" {
  name           = "${local.DDB_TABLE_NAME_PREFIX}-${var.env}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = local.DDB_TABLE_HASH_KEY

  attribute {
    name = local.DDB_TABLE_HASH_KEY
    type = "S"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Environment = var.env
  }
}