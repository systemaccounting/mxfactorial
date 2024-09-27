resource "aws_ecr_repository" "default" {
  name                 = "${var.env_id}/${var.env}/${var.service_name}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_delete
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "default" {
  repository = aws_ecr_repository.default.name
  policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "keep last ${var.max_image_storage_count} images",
        selection = {
          tagStatus   = "any",
          countType   = "imageCountMoreThan",
          countNumber = var.max_image_storage_count
        },
        action = {
          type = "expire"
        }
      }
    ]
  })
}
