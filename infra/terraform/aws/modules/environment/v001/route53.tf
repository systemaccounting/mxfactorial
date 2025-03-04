data "aws_route53_zone" "default" {
  count = var.custom_domain_name == "" ? 0 : 1
  name  = "${var.custom_domain_name}."
}
