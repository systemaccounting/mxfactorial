resource "aws_ecr_repository" "go_migrate" {
  name                 = "${local.GO_MIGRATE}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "auto_confirm" {
  name                 = "${local.AUTO_CONFIRM}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}


resource "aws_ecr_repository" "balance_by_account" {
  name                 = "${local.BALANCE_BY_ACCOUNT}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "graphql" {
  name                 = "${local.GRAPHQL}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "request_approve" {
  name                 = "${local.REQUEST_APPROVE}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "request_by_id" {
  name                 = "${local.REQUEST_BY_ID}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "requests_by_account" {
  name                 = "${local.REQUESTS_BY_ACCOUNT}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "request_create" {
  name                 = "${local.REQUEST_CREATE}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "rule" {
  name                 = "${local.RULE}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "transaction_by_id" {
  name                 = "${local.TRANSACTION_BY_ID}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "transactions_by_account" {
  name                 = "${local.TRANSACTIONS_BY_ACCOUNT}-${local.ID_ENV}"
  image_tag_mutability = "MUTABLE"
  force_delete         = var.force_destroy_storage
  image_scanning_configuration {
    scan_on_push = true
  }
}
