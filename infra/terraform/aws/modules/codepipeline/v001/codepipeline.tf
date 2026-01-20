locals {
  ID_ENV                 = "${var.env_id}-${var.env}"
  PROJECT_CONF_FILE_NAME = "project.yaml"
  PROJECT_CONF           = yamldecode(file("../../../../../${local.PROJECT_CONF_FILE_NAME}"))
  CODEPIPELINE_ENV_VAR   = local.PROJECT_CONF.infra.terraform.aws.modules.codepipeline.env_var.set
  SERVICES_ZIP           = local.PROJECT_CONF.scripts.env_var.set.SERVICES_ZIP.default
  BUILD_OBJECT_KEY_PATH  = local.CODEPIPELINE_ENV_VAR.BUILD_OBJECT_KEY_PATH.default
  BUILD_SOURCE_LOCATION  = "${local.BUILD_OBJECT_KEY_PATH}/${local.SERVICES_ZIP}"
}

resource "aws_codepipeline" "build" {
  name          = "mxfactorial-build-${local.ID_ENV}"
  role_arn      = aws_iam_role.codepipeline.arn
  pipeline_type = "V2"

  artifact_store {
    location = var.artifacts_bucket_name
    type     = "S3"
  }

  stage {
    name = "Source"
    action {
      name             = "S3Source"
      category         = "Source"
      owner            = "AWS"
      provider         = "S3"
      version          = "1"
      output_artifacts = ["source_output"]
      configuration = {
        S3Bucket             = var.artifacts_bucket_name
        S3ObjectKey          = local.BUILD_SOURCE_LOCATION
        PollForSourceChanges = false
      }
    }
  }

  stage {
    name = "Build"

    dynamic "action" {
      for_each = var.codebuild_project_names
      content {
        name            = action.key
        category        = "Build"
        owner           = "AWS"
        provider        = "CodeBuild"
        input_artifacts = ["source_output"]
        version         = "1"
        run_order       = 1
        configuration = {
          ProjectName = action.value
        }
      }
    }
  }
}

resource "aws_cloudwatch_event_rule" "s3_trigger" {
  name = "mxfactorial-build-trigger-${local.ID_ENV}"

  event_pattern = jsonencode({
    source      = ["aws.s3"]
    detail-type = ["Object Created"]
    detail = {
      bucket = { name = [var.artifacts_bucket_name] }
      object = { key = [{ prefix = local.BUILD_SOURCE_LOCATION }] }
    }
  })
}

resource "aws_cloudwatch_event_target" "codepipeline" {
  rule     = aws_cloudwatch_event_rule.s3_trigger.name
  arn      = aws_codepipeline.build.arn
  role_arn = aws_iam_role.eventbridge_pipeline.arn
}

resource "aws_iam_role" "codepipeline" {
  name = "codepipeline-build-${local.ID_ENV}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "codepipeline" {
  name = "codepipeline-build-${local.ID_ENV}"
  role = aws_iam_role.codepipeline.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning",
          "s3:PutObject"
        ]
        Resource = [
          var.artifacts_bucket_arn,
          "${var.artifacts_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "eventbridge_pipeline" {
  name = "eventbridge-pipeline-${local.ID_ENV}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "eventbridge_pipeline" {
  name = "eventbridge-pipeline-${local.ID_ENV}"
  role = aws_iam_role.eventbridge_pipeline.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "codepipeline:StartPipelineExecution"
        Resource = aws_codepipeline.build.arn
      }
    ]
  })
}
