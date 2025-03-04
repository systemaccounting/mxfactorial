variable "env" {}
variable "db_snapshot_id" {}
variable "rds_allow_major_version_upgrade" {}
variable "rds_instance_class" {}
variable "rds_parameter_group" {}
variable "rds_instance_name" {}
variable "rds_engine_version" {}
variable "apigw_authorization_header_key" {}
variable "enable_api_auth" {}
variable "graphql_deployment_version" {}
variable "initial_account_balance" {}
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
variable "microk8s_instance_type" {}
variable "enable_microk8s" { type = bool }
# variable "apigwv2_logging_level" {}
variable "apigwv2_burst_limit" {}
variable "apigwv2_rate_limit" {}