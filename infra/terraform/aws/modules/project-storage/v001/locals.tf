locals {
  ID_ENV                 = "${var.env_id}-${var.env}"
  PROJECT_CONF_FILE_NAME = "project.yaml"
  PROJECT_CONF           = yamldecode(file("../../../../../${local.PROJECT_CONF_FILE_NAME}"))
  STORAGE_ENV_VAR        = local.PROJECT_CONF.infra.terraform.aws.modules.project-storage.env_var.set
  DDB_TABLE_NAME_PREFIX  = local.STORAGE_ENV_VAR.DDB_TABLE_NAME_PREFIX.default
  DDB_TABLE_HASH_KEY     = local.STORAGE_ENV_VAR.DDB_TABLE_HASH_KEY.default
  ID_ENV_PREFIX          = "${var.env_id}/${var.env}"

  // add a terraform_data precondition to fail
  // if a service is not found in project.yaml
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
  CLIENT                  = "client"

  // used in ecr.tf
  ECR_REPOS = toset([
    local.GO_MIGRATE,
    local.AUTO_CONFIRM,
    local.BALANCE_BY_ACCOUNT,
    local.GRAPHQL,
    local.REQUEST_APPROVE,
    local.REQUEST_BY_ID,
    local.REQUESTS_BY_ACCOUNT,
    local.REQUEST_CREATE,
    local.RULE,
    local.TRANSACTION_BY_ID,
    local.TRANSACTIONS_BY_ACCOUNT,
    local.CLIENT,
  ])

}

// 1. fails if services not found in project.yaml
// 2. single resource with multiple preconditions used to avoid increasing state file size
resource "terraform_data" "locals_test" {
  lifecycle {
    // create a precondition to fail if the services are not found in project.yaml
    precondition {
      condition     = lookup(local.PROJECT_CONF.migrations, local.GO_MIGRATE, null) != null
      error_message = "${local.GO_MIGRATE} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }
    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.AUTO_CONFIRM, null) != null
      error_message = "${local.AUTO_CONFIRM} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.BALANCE_BY_ACCOUNT, null) != null
      error_message = "${local.BALANCE_BY_ACCOUNT} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.GRAPHQL, null) != null
      error_message = "${local.GRAPHQL} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.REQUEST_APPROVE, null) != null
      error_message = "${local.REQUEST_APPROVE} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.REQUEST_BY_ID, null) != null
      error_message = "${local.REQUEST_BY_ID} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.REQUESTS_BY_ACCOUNT, null) != null
      error_message = "${local.REQUESTS_BY_ACCOUNT} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.REQUEST_CREATE, null) != null
      error_message = "${local.REQUEST_CREATE} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.RULE, null) != null
      error_message = "${local.RULE} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.TRANSACTION_BY_ID, null) != null
      error_message = "${local.TRANSACTION_BY_ID} not found"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF.services, local.TRANSACTIONS_BY_ACCOUNT, null) != null
      error_message = "${local.TRANSACTIONS_BY_ACCOUNT} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }

    precondition {
      condition     = lookup(local.PROJECT_CONF, local.CLIENT, null) != null
      error_message = "${local.CLIENT} not found in ${local.PROJECT_CONF_FILE_NAME}"
    }
  }
}
