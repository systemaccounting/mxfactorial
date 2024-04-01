resource "aws_ecr_repository" "go_migrate" {
  name                 = "${local.GO_MIGRATE}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}