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
