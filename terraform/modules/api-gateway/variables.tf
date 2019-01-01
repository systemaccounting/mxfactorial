variable "graphql_server_invoke_arn" {
  description = "Lambda GrpahQL sever invoke arn"
}

variable "graphql_server_function_name" {
  description = "Lambda GraphQL server function name"
}

variable "certificate_arn" {
  description = "Certificate ARN"
}

variable "stage_name" {
  description = "API gateway stage name"
}

variable "api_name" {
  description = "GraphQL enpoint name"
}

variable "domain_name" {
  description = "API Gateway domain name"
}

variable "iam_role_name" {
  description = "IAM role name"
}

variable "iam_role_policy_name" {
  description = "IAM role policy name"
}
