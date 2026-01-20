# integration test codebuild project
# runs full test suite with all services via docker compose

resource "aws_codebuild_project" "integ" {
  name         = "mxfactorial-integ-${local.ID_ENV}"
  service_role = aws_iam_role.integ.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type    = "BUILD_GENERAL1_LARGE"
    image           = "aws/codebuild/standard:7.0"
    type            = "LINUX_CONTAINER"
    privileged_mode = true

    environment_variable {
      name  = "ENV_ID"
      value = var.env_id
    }
    environment_variable {
      name  = "ENV"
      value = var.env
    }
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id
    }
    environment_variable {
      name  = "REGION"
      value = data.aws_region.current.id
    }
  }

  source {
    type      = "S3"
    location  = "${aws_s3_bucket.artifacts.bucket}/${local.INTEG_SOURCE_LOCATION}"
    buildspec = <<-EOF
      version: 0.2
      phases:
        install:
          # codebuild standard:7.0 has node 18, but aws-sdk requires node >= 20
          runtime-versions:
            nodejs: 20
        pre_build:
          commands:
            # install test dependencies
            - apt-get update && apt-get install -y postgresql-client
            - curl -L https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -o /usr/local/bin/yq && chmod +x /usr/local/bin/yq
            - |
              curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
              . $HOME/.cargo/env
              rustup component add rustfmt clippy
            - npx playwright install-deps
            # pull pre-built service images from ecr and tag as latest for docker compose
            - aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
            - export ECR_URI=$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ENV_ID/$ENV
            - |
              for SVC in ${join(" ", local.ECR_REPOS)}; do
                echo "pulling $SVC..."
                TAG=$(aws ecr describe-images --repository-name $ENV_ID/$ENV/$SVC --region $REGION --query 'sort_by(imageDetails,&imagePushedAt)[-1].imageTags[0]' --output text 2>/dev/null || echo "")
                if [ -n "$TAG" ] && [ "$TAG" != "None" ]; then
                  docker pull $ECR_URI/$SVC:$TAG
                  docker tag $ECR_URI/$SVC:$TAG $SVC:latest
                else
                  echo "skipping $SVC (no images)"
                fi
              done
        build:
          commands:
            # build storage (postgres), then start all services with pre-built images
            - docker compose -f docker/storage.yaml build
            - docker compose -f docker/storage.yaml -f docker/services.yaml up -d --no-build
            - until docker exec mxf-postgres-1 pg_isready -U postgres; do sleep 1; done
            # run tests
            - make --no-print-directory -C crates/pg test-db
            - make --no-print-directory -C crates/redisclient test-cache
            - make --no-print-directory -C tests test-local
            - make --no-print-directory -C client test
        post_build:
          commands:
            - docker compose -f docker/storage.yaml -f docker/services.yaml down
      EOF
  }
}

resource "aws_iam_role" "integ" {
  name = "mxfactorial-integ-${local.ID_ENV}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "integ" {
  name = "mxfactorial-integ-${local.ID_ENV}"
  role = aws_iam_role.integ.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "${aws_s3_bucket.artifacts.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.artifacts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages"
        ]
        Resource = "arn:aws:ecr:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:repository/${var.env_id}/${var.env}/*"
      }
    ]
  })
}
