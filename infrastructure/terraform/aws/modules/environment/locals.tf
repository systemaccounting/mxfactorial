locals {
  client_url = var.env == "prod" ? "mxfactorial.io" : "${var.env}.mxfactorial.io"
  api_url    = var.env == "prod" ? "api.mxfactorial.io" : "${var.env}-api.mxfactorial.io"
}
