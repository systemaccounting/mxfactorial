locals {
  ID_ENV                       = "${var.env_id}-${var.env}"
  TITLED_ID_ENV                = replace(title(local.ID_ENV), "-", "")
  SPACED_ID_ENV                = replace(local.ID_ENV, "-", " ")
  PROJECT_CONF                 = yamldecode(file("../../../../../project.yaml"))
  SERVICES_CONF                = local.PROJECT_CONF.services
  RULE_PORT                    = local.SERVICES_CONF.rule.env_var.set.RULE_PORT.default
  GRAPHQL_PORT                 = local.SERVICES_CONF.graphql.env_var.set.GRAPHQL_PORT.default
  READINESS_CHECK_PATH         = local.PROJECT_CONF.infrastructure.terraform.aws.modules.web-adapter-lambda.env_var.set.READINESS_CHECK_PATH.default
  BALANCE_BY_ACCOUNT_PORT      = local.SERVICES_CONF.balance-by-account.env_var.set.BALANCE_BY_ACCOUNT_PORT.default
  TRANSACTION_BY_ID_PORT       = local.SERVICES_CONF.transaction-by-id.env_var.set.TRANSACTION_BY_ID_PORT.default
  TRANSACTIONS_BY_ACCOUNT_PORT = local.SERVICES_CONF.transactions-by-account.env_var.set.TRANSACTIONS_BY_ACCOUNT_PORT.default
  REQUEST_BY_ID_PORT           = local.SERVICES_CONF.request-by-id.env_var.set.REQUEST_BY_ID_PORT.default
  REQUESTS_BY_ACCOUNT_PORT     = local.SERVICES_CONF.requests-by-account.env_var.set.REQUESTS_BY_ACCOUNT_PORT.default
  REQUEST_APPROVE_PORT         = local.SERVICES_CONF.request-approve.env_var.set.REQUEST_APPROVE_PORT.default
  REQUEST_CREATE_PORT          = local.SERVICES_CONF.request-create.env_var.set.REQUEST_CREATE_PORT.default
  RETURN_RECORD_LIMIT          = local.SERVICES_CONF.env_var.set.RETURN_RECORD_LIMIT.default
  WEB_ADAPTER_LAYER_VERSION    = local.PROJECT_CONF.infrastructure.terraform.aws.modules.web-adapter-lambda.env_var.set.WEB_ADAPTER_LAYER_VERSION.default
  GO_MIGRATE_PORT              = local.PROJECT_CONF.migrations.go-migrate.env_var.set.GO_MIGRATE_PORT.default
}
