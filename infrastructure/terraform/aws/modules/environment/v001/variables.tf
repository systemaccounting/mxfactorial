variable "env" {}
variable "db_snapshot_id" {}
variable "rds_allow_major_version_upgrade" {}
variable "rds_instance_class" {}
variable "rds_parameter_group" {}
variable "rds_instance_name" {}
variable "notifications_return_limit" {}
variable "requests_by_account_return_limit" {}
variable "transactions_by_account_return_limit" {}
variable "apigw_authorization_header_key" {}
variable "enable_api_auth" {}
variable "enable_notifications" {}
variable "graphql_deployment_version" {}
variable "initial_account_balance" {}
variable "client_origin_bucket_name" {}
variable "enable_api_auto_deploy" {}
variable "artifacts_bucket_name" {}
variable "custom_domain_name" { default = "" }
variable "client_cert_arn" { default = "" }
variable "api_cert_arn" { default = "" }
variable "ssm_prefix" {}
variable "env_id" {}
variable "build_db" { type = bool }
variable "build_cache" { type = bool }
variable "readiness_check_path" { default = "/healthz" } // todo: assign from root project.yaml
variable "web_adapter_layer_version" {}
