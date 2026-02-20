resource "aws_sns_topic" "gdp" {
  name = "gdp-${local.ID_ENV}"
}

resource "aws_iam_policy" "gdp_sns_publish" {
  name = "gdp-sns-publish-${local.ID_ENV}"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["sns:Publish"]
      Resource = aws_sns_topic.gdp.arn
    }]
  })
}
