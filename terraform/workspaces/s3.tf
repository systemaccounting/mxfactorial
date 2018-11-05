resource "aws_s3_bucket" "mxfactorial-react" {
  bucket = "mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}"

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}/*"
    }
  ]
}
POLICY

  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

resource "aws_s3_bucket" "www-mxfactorial-react" {
  //create www-prefix distribution for prod only
  count  = "${lookup(var.environment, "${terraform.workspace}") == "prod" ?  1 : 0}"
  bucket = "www-mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}"

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
      "Resource": "arn:aws:s3:::www-mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}/*"
    }
  ]
}
POLICY

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://${aws_cloudfront_distribution.s3_react_distribution.domain_name}"
  }
}
