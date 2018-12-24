variable "environments" {
  type = "list"

  default = [
    "prod",
    "dev",
    "stg",
  ]
}
