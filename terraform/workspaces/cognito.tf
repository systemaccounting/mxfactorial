resource "aws_cognito_user_pool" "pool" {
  name = "mxfactorial-${lookup(var.environment, "${terraform.workspace}")}"

  lambda_config {
    pre_sign_up = "${aws_lambda_function.cognito_account_auto_confirm.arn}"
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
  name = "mxfactorial-client-${lookup(var.environment, "${terraform.workspace}")}"

  user_pool_id        = "${aws_cognito_user_pool.pool.id}"
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
    "custom:account",
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
    "custom:account",
  ]
}

# prior art: https://github.com/hashicorp/terraform/issues/8344#issuecomment-265548941
########## Create a zip file with auto-approve Lambda code for Cognito ##########
data "archive_file" "cognito_auto_approve_lambda_zip" {
  type        = "zip"
  source_dir  = "./cognito/auto-confirm"
  output_path = "cognitoAutoApproveLambda.zip"
}

########## Create an auto-approve Lambda function for Cognito ##########
resource "aws_lambda_function" "cognito_account_auto_confirm" {
  filename         = "cognitoAutoApproveLambda.zip"
  source_code_hash = "${data.archive_file.cognito_auto_approve_lambda_zip.output_base64sha256}"
  function_name    = "cognito-account-auto-confirm-${lookup(var.environment, "${terraform.workspace}")}"
  role             = "${aws_iam_role.cognito_account_auto_confirm_lambda_role.arn}"
  description      = "Auto confirms new Cognito accounts"
  handler          = "index.handler"
  runtime          = "nodejs8.10"
}

########## Create Cognito acount auto-approve Lambda function role and policy ##########
resource "aws_iam_role" "cognito_account_auto_confirm_lambda_role" {
  name = "cognito-account-auto-confirm-lambda-role-${lookup(var.environment, "${terraform.workspace}")}"

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
  name = "cognito-account-auto-confirm-lambda-policy-${lookup(var.environment, "${terraform.workspace}")}"
  role = "${aws_iam_role.cognito_account_auto_confirm_lambda_role.id}"

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
  function_name = "${aws_lambda_function.cognito_account_auto_confirm.function_name}"
  principal     = "cognito-idp.amazonaws.com"
}

########## Create a zip file with delete Faker account Lambda code for Cognito ##########
data "archive_file" "delete_faker_account_lambda_zip" {
  type        = "zip"
  source_dir  = "./cognito/delete-faker-accounts"
  output_path = "deleteFakerAccounts.zip"
}

########## Create a function to delete e2e Faker accounts in Cognito ##########
resource "aws_lambda_function" "delete_faker_cognito_accounts_lambda" {
  filename         = "deleteFakerAccounts.zip"
  source_code_hash = "${data.archive_file.delete_faker_account_lambda_zip.output_base64sha256}"
  function_name    = "delete-faker-cognito-accounts-lambda-${lookup(var.environment, "${terraform.workspace}")}"
  role             = "${aws_iam_role.cognito_account_auto_confirm_lambda_role.arn}"
  description      = "Deletes Faker accounts created during e2e testing"
  handler          = "index.handler"
  runtime          = "nodejs8.10"

  environment {
    variables = {
      REGION          = "${lookup(var.region, "${terraform.workspace}")}"
      COGNITO_POOL_ID = "${aws_cognito_user_pool.pool.id}"
    }
  }
}

########## Create delete Faker account Lambda function role and policy ##########
resource "aws_iam_role" "delete_faker_cognito_accounts_lambda_role" {
  name = "delete-faker-cognito-accounts-lambda-role-${lookup(var.environment, "${terraform.workspace}")}"

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

resource "aws_iam_role_policy" "delete_faker_cognito_accounts_lambda_policy" {
  name = "cognito_account-auto-confirm-lambda-policy-${lookup(var.environment, "${terraform.workspace}")}"
  role = "${aws_iam_role.delete_faker_cognito_accounts_lambda_role.id}"

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
    }
  ]
}
EOF
}

########## CloudWatch Event Rule to execute delete Faker account Lambda function daily ##########
resource "aws_cloudwatch_event_rule" "delete_faker_accounts_rule" {
  name                = "delete-faker-accounts-daily-${lookup(var.environment, "${terraform.workspace}")}"
  description         = "Delete Faker accounts created in Cognito from e2e tests"
  schedule_expression = "rate(1 day)"
}

########## Bind daily CloudWatch Event to delete Faker account Lambda ##########
resource "aws_cloudwatch_event_target" "delete_faker_lambda" {
  rule      = "${aws_cloudwatch_event_rule.delete_faker_accounts_rule.name}"
  target_id = "send_to_delete_faker_lambda_${lookup(var.environment, "${terraform.workspace}")}"
  arn       = "${aws_lambda_function.delete_faker_cognito_accounts_lambda.arn}"
}

########## Permit daily CloudWatch Event invocation of delete Faker account Lambda ##########
resource "aws_lambda_permission" "delete_faker_accounts_daily" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.delete_faker_cognito_accounts_lambda.function_name}"
  principal     = "events.amazonaws.com"
  source_arn    = "${aws_cloudwatch_event_rule.delete_faker_accounts_rule.arn}"
}
