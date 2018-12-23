resource "aws_s3_bucket" "mxfactorial_react" {
  bucket = "mxfactorial-react-${terraform.workspace}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mxfactorial-react-${terraform.workspace}/*"
    }
  ]
}
POLICY

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  force_destroy = true
}

resource "aws_s3_bucket" "www_mxfactorial_react" {
  //create redirect from www-prefix distribution for prod only
  count  = "${"${terraform.workspace}" == "prod" ?  1 : 0}"
  bucket = "www-mxfactorial-react-prod"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFrontReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www-mxfactorial-react-${terraform.workspace}/*"
    }
  ]
}
POLICY

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://${module.cloudfront.s3_react_distribution_domain_name}"
  }

  force_destroy = true
}
