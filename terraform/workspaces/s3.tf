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
  bucket = "www-mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}"

  website {
    # aws parses https prefix and bucket name when creating redirect rule
    redirect_all_requests_to = "https://mxfactorial-react-${lookup(var.environment, "${terraform.workspace}")}"
  }
}
