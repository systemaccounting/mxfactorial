variable "environment" {
  type = string
}

variable "ssl_arn" {
  type = string
}

variable "certificate_arn" {
  type        = string
  description = "Certificate ARN"
}

variable "db_snapshot_id" {
  type = string
}

variable "req_query_return_limit" {
  type = number
}
