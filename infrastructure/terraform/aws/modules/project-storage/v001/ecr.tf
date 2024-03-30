resource "aws_ecr_repository" "go_migrate" {
  name                 = "go-migrate-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
