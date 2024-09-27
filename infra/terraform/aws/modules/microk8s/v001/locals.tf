locals {
  NAME                         = "microk8s"
  ID_ENV                       = "${var.env_id}-${var.env}"
  TITLED_ID_ENV                = replace(title(local.ID_ENV), "-", "")
  SPACED_ID_ENV                = replace(local.ID_ENV, "-", " ")
  PROJECT_CONF                 = yamldecode(file("../../../../../project.yaml"))
  MICROK8S_CONF                = local.PROJECT_CONF.infra.terraform.aws.modules.microk8s.env_var.set
  MICROK8S_SSH_KEY_NAME_PREFIX = local.MICROK8S_CONF.MICROK8S_SSH_KEY_NAME_PREFIX.default
  MICROK8S_SSH_PORT            = local.MICROK8S_CONF.MICROK8S_SSH_PORT.default
}
