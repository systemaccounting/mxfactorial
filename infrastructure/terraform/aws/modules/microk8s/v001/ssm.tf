resource "aws_ssm_parameter" "ssh_pub_key" {
  name        = "/${var.ssm_prefix}/${local.MICROK8S_CONF.MICROK8S_SSH_PUB_KEY.ssm}"
  description = "microk8s ssh public key in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_key_pair.default.public_key
}

resource "aws_ssm_parameter" "ssh_priv_key" {
  name        = "/${var.ssm_prefix}/${local.MICROK8S_CONF.MICROK8S_SSH_PRIV_KEY.ssm}"
  description = "microk8s ssh private key in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = tls_private_key.default.private_key_pem
}

resource "aws_ssm_parameter" "ssh_host" {
  name        = "/${var.ssm_prefix}/${local.MICROK8S_CONF.MICROK8S_SSH_HOST.ssm}"
  description = "microk8s ssh host in ${local.SPACED_ID_ENV}"
  type        = "SecureString"
  value       = aws_instance.default.public_ip
}