locals {
  ID_ENV                  = "${var.env_id}-${var.env}"
  PROJECT_CONF            = "project.yaml"
  CONF_FILE               = yamldecode(file("../../../../../${local.PROJECT_CONF}"))
  STORAGE_ENV_VAR         = local.CONF_FILE.infrastructure.terraform.aws.modules.project-storage.env_var.set
  DDB_TABLE_NAME_PREFIX   = local.STORAGE_ENV_VAR.DDB_TABLE_NAME_PREFIX.default
  DDB_TABLE_HASH_KEY      = local.STORAGE_ENV_VAR.DDB_TABLE_HASH_KEY.default
  GO_MIGRATE              = "go-migrate"
  AUTO_CONFIRM            = "auto-confirm"
  BALANCE_BY_ACCOUNT      = "balance-by-account"
  GRAPHQL                 = "graphql"
  REQUEST_APPROVE         = "request-approve"
  REQUEST_BY_ID           = "request-by-id"
  REQUESTS_BY_ACCOUNT     = "requests-by-account"
  REQUEST_CREATE          = "request-create"
  RULE                    = "rule"
  TRANSACTION_BY_ID       = "transaction-by-id"
  TRANSACTIONS_BY_ACCOUNT = "transactions-by-account"

}

// fails if services not found in project.yaml
resource "terraform_data" "locals_test" {
  lifecycle {
    precondition {
      condition     = lookup(local.CONF_FILE.migrations, local.GO_MIGRATE, null) != null
      error_message = "${local.GO_MIGRATE} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.AUTO_CONFIRM, null) != null
      error_message = "${local.AUTO_CONFIRM} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.BALANCE_BY_ACCOUNT, null) != null
      error_message = "${local.BALANCE_BY_ACCOUNT} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.GRAPHQL, null) != null
      error_message = "${local.GRAPHQL} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.REQUEST_APPROVE, null) != null
      error_message = "${local.REQUEST_APPROVE} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.REQUEST_BY_ID, null) != null
      error_message = "${local.REQUEST_BY_ID} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.REQUESTS_BY_ACCOUNT, null) != null
      error_message = "${local.REQUESTS_BY_ACCOUNT} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.REQUEST_CREATE, null) != null
      error_message = "${local.REQUEST_CREATE} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.RULE, null) != null
      error_message = "${local.RULE} not found in ${local.PROJECT_CONF}"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.TRANSACTION_BY_ID, null) != null
      error_message = "${local.TRANSACTION_BY_ID} not found"
    }

    precondition {
      condition     = lookup(local.CONF_FILE.services, local.TRANSACTIONS_BY_ACCOUNT, null) != null
      error_message = "${local.TRANSACTIONS_BY_ACCOUNT} not found in ${local.PROJECT_CONF}"
    }
  }
}
