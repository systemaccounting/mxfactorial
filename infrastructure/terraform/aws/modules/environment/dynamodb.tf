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

locals {
  # no Automatic Semicolon Insertion. add manually:
  nine_percent_ca_sales_tax_rule = "let TAX_TRANSACTION_NAME = '9% state sales tax'; let accountItems = items.filter(item => {   return item.name !== TAX_TRANSACTION_NAME; }); let salesTaxValue = 0; accountItems.forEach(item => {   let quantity = item.quantity || 1;   let price = item.price || 0;   salesTaxValue += price * quantity * 0.09; }); if (salesTaxValue > 0) {   accountItems.push({     author: accountItems[0].author,     rule_instance_id: ruleId,     name: TAX_TRANSACTION_NAME,     price: salesTaxValue.toFixed(3),     quantity: 1,     creditor: 'StateOfCalifornia',     creditor_approval_time: new Date().toISOString(),     debitor: accountItems[0].debitor,     transaction_id: accountItems[0].transaction_id   }); }; console.log('Applied rules: ', JSON.stringify(accountItems)); return accountItems;"
}

resource "aws_dynamodb_table_item" "nine_percent_ca_sales_tax" {
  table_name = aws_dynamodb_table.rule_instances.name
  hash_key   = aws_dynamodb_table.rule_instances.hash_key
  range_key  = aws_dynamodb_table.rule_instances.range_key

  item = <<ITEM
{
  "rule_instance_id": {
    "S": "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d"
  },
  "key_schema": {
    "S": "name:"
  },
  "description": {
    "S": "created from infrastructure/terraform/aws/modules/environment/dynamodb.tf"
  },
  "time_added_utc": {
    "S": "${formatdate("DD MMM YYYY hh:mm ZZZ", timestamp())}"
  },
  "rule": {
    "S": "${local.nine_percent_ca_sales_tax_rule}"
  }
}
ITEM
}
