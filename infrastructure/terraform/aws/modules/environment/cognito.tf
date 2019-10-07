resource "aws_cognito_user_pool" "pool" {
  name = "mxfactorial-${var.environment}"

  lambda_config {
    pre_sign_up = aws_lambda_function.cognito_account_auto_confirm.arn
  }

  password_policy {
    minimum_length    = 6
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
    require_uppercase = false
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "account"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "firstName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "middleName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "lastName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "country"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "streetNumber"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "floorNumber"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "unit"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "cityName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "stateName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "postalCode"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "countryCode"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "areaCode"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "phoneNumber"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "dateOfBirth"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "industryName"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "occupation"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "emailAddress"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "account"
    required                 = false

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
}

resource "aws_cognito_user_pool_client" "client" {
  name = "mxfactorial-client-${var.environment}"

  user_pool_id        = aws_cognito_user_pool.pool.id
  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH", "USER_PASSWORD_AUTH"]

  read_attributes = [
    "custom:account",
    "custom:firstName",
    "custom:middleName",
    "custom:lastName",
    "custom:country",
    "custom:streetNumber",
    "custom:floorNumber",
    "custom:unit",
    "custom:cityName",
    "custom:stateName",
    "custom:postalCode",
    "custom:countryCode",
    "custom:areaCode",
    "custom:phoneNumber",
    "custom:dateOfBirth",
    "custom:industryName",
    "custom:occupation",
    "custom:emailAddress",
  ]

  write_attributes = [
    "custom:account",
    "custom:firstName",
    "custom:middleName",
    "custom:lastName",
    "custom:country",
    "custom:streetNumber",
    "custom:floorNumber",
    "custom:unit",
    "custom:cityName",
    "custom:stateName",
    "custom:postalCode",
    "custom:countryCode",
    "custom:areaCode",
    "custom:phoneNumber",
    "custom:dateOfBirth",
    "custom:industryName",
    "custom:occupation",
    "custom:emailAddress",
  ]
}

data "aws_s3_bucket_object" "cognito_account_auto_confirm" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "auto-confirm-src.zip"
}

########## Create an auto-approve Lambda function for Cognito ##########
resource "aws_lambda_function" "cognito_account_auto_confirm" {
  function_name     = "cognito-account-auto-confirm-${var.environment}"
  description       = "Auto confirms new Cognito accounts in ${var.environment}"
  s3_bucket         = data.aws_s3_bucket_object.cognito_account_auto_confirm.bucket
  s3_key            = data.aws_s3_bucket_object.cognito_account_auto_confirm.key
  s3_object_version = data.aws_s3_bucket_object.cognito_account_auto_confirm.version_id
  role              = aws_iam_role.cognito_account_auto_confirm_lambda_role.arn
  handler           = "index.handler"
  runtime           = "nodejs8.10"
}

resource "aws_cloudwatch_log_group" "cognito_account_auto_confirm" {
  name              = "/aws/lambda/${aws_lambda_function.cognito_account_auto_confirm.function_name}"
  retention_in_days = 30
}

########## Create Cognito acount auto-approve Lambda function role and policy ##########
resource "aws_iam_role" "cognito_account_auto_confirm_lambda_role" {
  name = "cognito-account-auto-confirm-lambda-role-${var.environment}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "cognito_account_auto_confirm_lambda_policy" {
  name = "cognito-account-auto-confirm-lambda-policy-${var.environment}"
  role = aws_iam_role.cognito_account_auto_confirm_lambda_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Sid": "VisualEditor1",
      "Effect": "Allow",
      "Action": "cognito-idp:*",
      "Resource": "${aws_cognito_user_pool.pool.arn}"
    }
  ]
}
EOF
}

########## Permit Cognito invocation of auto confirm account Lambda ##########
resource "aws_lambda_permission" "allow_cognito" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_account_auto_confirm.function_name
  principal     = "cognito-idp.amazonaws.com"
}

data "aws_s3_bucket_object" "delete_faker_cognito_accounts_lambda" {
  bucket = "mxfactorial-artifacts-${var.environment}"
  key    = "delete-faker-src.zip"
}

########## Create a function to delete e2e Faker accounts in Cognito ##########
resource "aws_lambda_function" "delete_faker_cognito_accounts_lambda" {
  function_name     = "delete-faker-cognito-accounts-lambda-${var.environment}"
  description       = "Deletes Faker accounts created during e2e testing"
  s3_bucket         = data.aws_s3_bucket_object.delete_faker_cognito_accounts_lambda.bucket
  s3_key            = data.aws_s3_bucket_object.delete_faker_cognito_accounts_lambda.key
  s3_object_version = data.aws_s3_bucket_object.delete_faker_cognito_accounts_lambda.version_id
  role              = aws_iam_role.cognito_account_auto_confirm_lambda_role.arn
  handler           = "index.handler"
  runtime           = "nodejs8.10"

  environment {
    variables = {
      COGNITO_POOL_ID = aws_cognito_user_pool.pool.id
    }
  }
}

resource "aws_cloudwatch_log_group" "delete_faker_cognito_accounts_lambda" {
  name              = "/aws/lambda/${aws_lambda_function.delete_faker_cognito_accounts_lambda.function_name}"
  retention_in_days = 30
}

########## Create delete Faker account Lambda function role and policy ##########
resource "aws_iam_role" "delete_faker_cognito_accounts_lambda_role" {
  name = "delete-faker-cognito-accounts-lambda-role-${var.environment}"

  assume_role_policy = data.aws_iam_policy_document.delete_faker_cognito_accounts_lambda_role.json
}

data "aws_iam_policy_document" "delete_faker_cognito_accounts_lambda_role" {
  version = "2012-10-17"
  statement {
    sid = "DeleteFakerCognitoAccountsLambdaRole${var.environment}"
    actions = [
      "sts:AssumeRole"
    ]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    effect = "Allow"
  }
}

resource "aws_iam_role_policy" "delete_faker_cognito_accounts_lambda_policy" {
  name = "cognito_account-auto-confirm-lambda-policy-${var.environment}"
  role = aws_iam_role.delete_faker_cognito_accounts_lambda_role.id

  policy = data.aws_iam_policy_document.delete_faker_cognito_accounts_lambda_policy.json
}

data "aws_iam_policy_document" "delete_faker_cognito_accounts_lambda_policy" {
  version = "2012-10-17"
  statement {
    sid = "CognitoAccountAutoConfirmLambdaPolicy${var.environment}"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

########## CloudWatch Event Rule to execute delete Faker account Lambda function daily ##########
resource "aws_cloudwatch_event_rule" "delete_faker_accounts_rule" {
  name                = "delete-faker-accounts-daily-${var.environment}"
  description         = "Delete Faker accounts created in Cognito from e2e tests"
  schedule_expression = "rate(1 day)"
}

########## Bind daily CloudWatch Event to delete Faker account Lambda ##########
resource "aws_cloudwatch_event_target" "delete_faker_lambda" {
  rule      = aws_cloudwatch_event_rule.delete_faker_accounts_rule.name
  target_id = "send_to_delete_faker_lambda_${var.environment}"
  arn       = aws_lambda_function.delete_faker_cognito_accounts_lambda.arn
}

########## Permit daily CloudWatch Event invocation of delete Faker account Lambda ##########
resource "aws_lambda_permission" "delete_faker_accounts_daily" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_faker_cognito_accounts_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.delete_faker_accounts_rule.arn
}
