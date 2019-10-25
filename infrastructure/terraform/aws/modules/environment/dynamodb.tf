resource "aws_dynamodb_table" "rule_instances" {
  name           = "rule-instances-${var.environment}"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "key_schema"
  range_key      = "rule_instance_id"

  attribute {
    name = "key_schema"
    type = "S"
  }

  attribute {
    name = "rule_instance_id"
    type = "S"
  }
}
