locals {
  client_url = var.environment == "prod" ? "mxfactorial.io" : "${var.environment}.mxfactorial.io"
  api_url    = var.environment == "prod" ? "api.mxfactorial.io" : "${var.environment}-api.mxfactorial.io"
}
