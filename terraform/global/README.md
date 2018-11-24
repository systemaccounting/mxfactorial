`aws_route53_record` fail to resolve attributes on count > 1 `aws_acm_certificate` with single `terraform apply`

workaround:
1. `terraform apply -target aws_acm_certificate.client_cert -target aws_acm_certificate.api_cert`
2. `terraform apply`